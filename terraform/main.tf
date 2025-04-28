# terraform/main.tf

# 2) Build a new, unique project name
locals {
  unique_project_name = "${var.project_name}-${var.developer_name}"
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = local.unique_project_name
  aws_region   = var.aws_region
}


# ———————————————————————————————————————————————————————————————
# 0️⃣ Self-Signed Certificate (pre-generated .crt/.key in repo)
# ———————————————————————————————————————————————————————————————
resource "aws_acm_certificate" "self_signed" {
  private_key      = file("${path.root}/self_signed.key")
  certificate_body = file("${path.root}/self_signed.crt")

  tags = {
    Name    = "${local.unique_project_name}-selfsigned-cert"
    Project = local.unique_project_name
  }
}

# 2. Fetch Latest Amazon Linux 2023 AMI via SSM
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# 3. Create Cognito first
module "cognito" {
  source         = "./modules/cognito"
  project_name   = local.unique_project_name
  user_pool_name = "${local.unique_project_name}-pool"
  user_groups    = ["recruiter", "candidate"]
  # …any other cognito inputs…
}

module "rds" {
  source       = "./modules/rds"
  project_name = local.unique_project_name
  subnet_ids   = module.vpc.data_subnet_ids
  vpc_id       = module.vpc.vpc_id
  db_name      = var.db_name
  db_username  = var.db_username
  db_password  = var.db_password
  # you may override db_name/db_username/etc here if you like
}

# 1️⃣ ALB Module (incl. self-signed TLS ACM import)
module "alb" {
  source                  = "./modules/alb"
  project_name            = local.unique_project_name
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.public_subnet_ids # ALB lives in public tier
  aws_acm_certificate_arn = aws_acm_certificate.self_signed.arn
}

# 2️⃣ ASG Module (behind the ALB’s Target Group)
module "asg" {
  source        = "./modules/asg"
  project_name  = local.unique_project_name
  aws_region    = var.aws_region
  ami_id        = data.aws_ssm_parameter.al2023_ami.value
  instance_type = var.instance_type
  subnet_ids    = module.vpc.app_subnet_ids # backend EC2 in private tier
  vpc_id        = module.vpc.vpc_id

  github_repo_url     = var.github_repo_url
  github_backend_path = var.github_backend_path

  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.user_pool_client_id

  db_endpoint = module.rds.endpoint
  db_port     = module.rds.port
  db_name     = module.rds.db_name
  db_username = module.rds.username
  db_password = var.db_password

  alb_sg_id        = module.alb.alb_security_group_id
  target_group_arn = module.alb.target_group_arn

  github_repo_branch = var.github_repo_branch
}

# Write backend/.env
resource "local_file" "backend_env" {
  depends_on = [module.cognito, module.rds]
  filename   = "${path.module}/../backend/.env"
  content    = <<-EOF
    AWS_REGION=${var.aws_region}
    COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}
    COGNITO_CLIENT_ID=${module.cognito.user_pool_client_id}
    DB_ENDPOINT=${module.rds.endpoint}
    DB_PORT=${module.rds.port}
    DB_NAME=${module.rds.db_name}
    DB_USERNAME=${module.rds.username}
    DB_PASSWORD=${var.db_password}
  EOF
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = local.unique_project_name
  aws_region   = var.aws_region
  frontend_dir = "${path.root}/../frontend"
  backend_url  = "https://${module.alb.alb_dns_name}"
  depends_on   = [module.asg]
}

module "monitoring" {
  source       = "./modules/monitoring"
  project_name = local.unique_project_name

  alb_arn         = module.alb.alb_arn
  asg_name        = module.asg.asg_name
  rds_instance_id = module.rds.db_instance_id

  alarm_phone_number          = var.alarm_phone_number
  vpc_id               = module.vpc.vpc_id
}

module "ssm_parameters" {
  source       = "./modules/ssm_parameters"
  project_name = local.unique_project_name

  parameters = {
    # static
    AWS_REGION            = var.aws_region
    # Cognito
    COGNITO_USER_POOL_ID  = module.cognito.user_pool_id
    COGNITO_CLIENT_ID     = module.cognito.user_pool_client_id
    # RDS
    DB_ENDPOINT           = module.rds.endpoint
    DB_PORT               = module.rds.port
    DB_NAME               = module.rds.db_name
    DB_USERNAME           = module.rds.username
    DB_PASSWORD           = var.db_password        # will be stored as SecureString
    # Front- & Back-end URLs
    FRONTEND_URL          = module.frontend.cloudfront_domain_name
    BACKEND_URL           = "https://${module.alb.alb_dns_name}"
    # anything else you like…
  }
}
