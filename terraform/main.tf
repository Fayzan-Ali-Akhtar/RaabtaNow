# 1. Discover Default VPC
data "aws_vpc" "default" {
  default = true
}

# 2. Fetch Latest Amazon Linux 2023 AMI via SSM
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# 3. Call the EC2 module
module "ec2_backend" {
  source               = "./modules/ec2"
  project_name         = var.project_name
  ami_id               = data.aws_ssm_parameter.al2023_ami.value
  instance_type        = var.instance_type
  vpc_id               = data.aws_vpc.default.id
  github_repo_url      = var.github_repo_url
  github_backend_path  = var.github_backend_path
}
