# terraform/main.tf

resource "random_id" "suffix" {
  byte_length = 4
}

# 2) Build a new, unique project name
locals {
  unique_project_name = "${var.project_name}-${random_id.suffix.hex}"
}

# 1. Discover Default VPC
data "aws_vpc" "default" {
  default = true
}

# 1a. Fetch all subnet IDs in that VPC
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
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
  source           = "./modules/cognito"
  project_name     = local.unique_project_name
  user_pool_name   = "${local.unique_project_name}-pool"
  user_groups      = ["recruiter", "candidate"]
  # …any other cognito inputs…
}

module "rds" {
  source       = "./modules/rds"
  project_name = local.unique_project_name
  db_name     = var.db_name
  db_username = var.db_username
  # you may override db_name/db_username/etc here if you like
}

# 1️⃣ ALB Module (incl. self-signed TLS ACM import)
module "alb" {
  source       = "./modules/alb"
  project_name = local.unique_project_name
  vpc_id       = data.aws_vpc.default.id
  subnet_ids   = data.aws_subnets.default.ids

   aws_acm_certificate_arn  = aws_acm_certificate.self_signed.arn
}

# 2️⃣ ASG Module (behind the ALB’s Target Group)
module "asg" {
  source               = "./modules/asg"
  project_name         = local.unique_project_name
  aws_region           = var.aws_region
  ami_id               = data.aws_ssm_parameter.al2023_ami.value
  instance_type        = var.instance_type
  subnet_ids           = data.aws_subnets.default.ids
  vpc_id              = data.aws_vpc.default.id

  github_repo_url      = var.github_repo_url
  github_backend_path  = var.github_backend_path

  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.user_pool_client_id

  db_endpoint          = module.rds.endpoint
  db_port              = module.rds.port
  db_name              = module.rds.db_name
  db_username          = module.rds.username
  db_password          = module.rds.password

  alb_sg_id            = module.alb.alb_security_group_id
  target_group_arn     = module.alb.target_group_arn

  github_repo_branch   = var.github_repo_branch
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
    DB_PASSWORD=${module.rds.password}
  EOF
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = local.unique_project_name
  aws_region   = var.aws_region
  frontend_dir = "${path.root}/../frontend"
  backend_url = "https://${module.alb.alb_dns_name}"
  depends_on   = [module.asg]
}
