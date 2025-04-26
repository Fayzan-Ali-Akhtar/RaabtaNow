# terraform/main.tf

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

# 2. Fetch Latest Amazon Linux 2023 AMI via SSM
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# 3. Create Cognito first
module "cognito" {
  source           = "./modules/cognito"
  project_name     = var.project_name
  user_pool_name   = "${var.project_name}-pool"
  user_groups      = ["recruiter", "candidate"]
  # …any other cognito inputs…
}

# 4. Then EC2 — depends_on ensures Terraform orders them
module "ec2_backend" {
  source               = "./modules/ec2"
  depends_on           = [
    module.cognito,     # Cognito must finish first
    module.rds,         # wait for RDS fully provisioned
    aws_acm_certificate.backend,   # ensure cert resource is created
  ]
  project_name         = var.project_name
  aws_region           = var.aws_region
  ami_id               = data.aws_ssm_parameter.al2023_ami.value
  instance_type        = var.instance_type
  vpc_id               = data.aws_vpc.default.id
  subnet_ids           = data.aws_subnets.default.ids
  github_repo_url      = var.github_repo_url
  github_backend_path  = var.github_backend_path

  # pass Cognito outputs into EC2
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_user_pool_arn = module.cognito.user_pool_arn
  cognito_client_id    = module.cognito.user_pool_client_id

  # pass RDS outputs into EC2
  db_endpoint   = module.rds.endpoint
  db_port       = module.rds.port
  db_name       = module.rds.db_name
  db_username   = module.rds.username
  db_password   = module.rds.password
}

module "rds" {
  source       = "./modules/rds"
  project_name = var.project_name
  db_name     = var.db_name
  db_username = var.db_username
  # you may override db_name/db_username/etc here if you like
}

# 4) After everything, write backend/.env
resource "local_file" "backend_env" {
  depends_on = [
    module.cognito,
    module.rds,
  ]
  filename = "${path.module}/../backend/.env"
  content  = <<-EOF
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
  project_name = var.project_name
  aws_region   = var.aws_region
  # this must point at your local frontend folder
  frontend_dir = "${path.root}/../frontend"

  backend_domain_name  = module.ec2_backend.backend_lb_dns_name  # just the ALB DNS

  depends_on   = [
    module.ec2_backend,  # wait for backend & its .env
  ]
}

# Adding .env file in frontend folder
resource "local_file" "frontend_env" {
  depends_on = [ module.ec2_backend ]      # ensure we know the backend URL
  filename   = "${path.module}/../frontend/.env.production"
  content    = <<-EOF
VITE_BACKEND_URL=${module.ec2_backend.backend_url}
EOF
}

# ─── EMAIL-validated ACM certificate ───────────────────────────────────────────
resource "aws_acm_certificate" "backend" {
  domain_name       = var.backend_domain_name
  validation_method = "EMAIL"

  tags = {
    Project = var.project_name
  }
}