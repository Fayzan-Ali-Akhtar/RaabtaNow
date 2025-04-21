# 1. IAM Role & Instance Profile for Session Manager
resource "aws_iam_role" "ssm_role" {
  name               = "${var.name_prefix}-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "${var.name_prefix}-ssm-profile"
  role = aws_iam_role.ssm_role.name
}

# 2. Security Group
resource "aws_security_group" "backend_sg" {
  name        = "${var.name_prefix}-sg"
  description = "Allow SSH (22) and HTTP (3000)"
  vpc_id      = var.vpc_id

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

# 3. EC2 Instance
resource "aws_instance" "this" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ssm_profile.name

  user_data = <<-EOF
    #!/bin/bash
    # Log all output to app.log
    exec > >(tee /home/ec2-user/app.log) 2>&1
    set -ex

    # Update packages and install Git + Node.js 20
    dnf update -y
    dnf install -y git nodejs20  # AL2023 package :contentReference[oaicite:1]{index=1}

    # Clone, build and run backend
    cd /home/ec2-user
    git clone ${var.github_repo_url}
    cd ${var.github_backend_path}

    npm install
    npm run build
    nohup npm start &
  EOF

  tags = {
    Name = var.name_prefix
  }
}
