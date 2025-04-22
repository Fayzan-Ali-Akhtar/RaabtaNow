# terraform/main.tf

# 1. Discover Default VPC
data "aws_vpc" "default" {
  default = true
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
  depends_on           = [ module.cognito ]            # Cognito must finish first
  project_name         = var.project_name
  aws_region           = var.aws_region
  ami_id               = data.aws_ssm_parameter.al2023_ami.value
  instance_type        = var.instance_type
  vpc_id               = data.aws_vpc.default.id
  github_repo_url      = var.github_repo_url
  github_backend_path  = var.github_backend_path

  # pass Cognito outputs into EC2
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_user_pool_arn = module.cognito.user_pool_arn
  cognito_client_id    = module.cognito.user_pool_client_id
}
