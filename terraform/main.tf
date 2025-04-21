# 1. Data sources
data "aws_vpc" "default" {
  default = true
}                                # Terraform Data Source for default VPC :contentReference[oaicite:0]{index=0}

data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}                                # Latest AL2023 image via SSM :contentReference[oaicite:1]{index=1}

# 2. IAM Role & Profile for Session Manager
resource "aws_iam_role" "ec2_ssm_role" {
  name = "ec2-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = "ec2-ssm-instance-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# 3. Security Group (SSH + port 3000)
resource "aws_security_group" "backend_sg" {
  name        = "backend-sg"
  description = "Allow SSH (22) and HTTP (3000)"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. EC2 Instance (AL2023 + Node.js 20)
resource "aws_instance" "backend" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm_profile.name

  user_data = <<-EOF
    #!/bin/bash
    # Redirect all output to a log for debugging:
    exec > >(tee /home/ec2-user/app.log) 2>&1
    set -ex

    # Update & install Git + Node.js 20 from AL2023
    dnf update -y
    dnf install -y git nodejs20   # NodeJS 20 package on AL2023 :contentReference[oaicite:2]{index=2}

    # Clone, build, and run your TypeScript backend
    cd /home/ec2-user
    git clone ${var.github_repo_url}
    cd ${var.github_backend_path}

    npm install
    npm run build
    nohup npm start &
  EOF

  tags = {
    Name = "raabta-backend"
  }
}
