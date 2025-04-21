# Discover default VPC
data "aws_vpc" "default" {
  default = true
}

# Fetch latest Amazon Linux 2023 AMI via SSM
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
} # :contentReference[oaicite:0]{index=0}

# Invoke our EC2 module
module "ec2_backend" {
  source               = "./modules/ec2"
  ami_id               = data.aws_ssm_parameter.al2023_ami.value
  instance_type        = var.instance_type
  vpc_id               = data.aws_vpc.default.id
  github_repo_url      = var.github_repo_url
  github_backend_path  = var.github_backend_path
}
