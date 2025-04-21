# 1. IAM Role & Profile for Session Manager
resource "aws_iam_role" "ssm_role" {
  name               = "${var.project_name}-ec2-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    Name = "${var.project_name}-ec2-ssm-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  # attachments do not support tags
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "${var.project_name}-ec2-ssm-profile"
  role = aws_iam_role.ssm_role.name

  tags = {
    Name = "${var.project_name}-ec2-ssm-profile"
  }
}

# 2. Security Group for SSH + HTTP(3000)
resource "aws_security_group" "backend_sg" {
  name        = "${var.project_name}-ec2-sg"
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
    description = "Backend HTTP"
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

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# 3. EC2 Instance running Node.js 20 backend
resource "aws_instance" "this" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ssm_profile.name

  user_data = <<-EOF
    #!/bin/bash
    exec > >(tee /home/ec2-user/app.log) 2>&1
    set -ex

    # Update & install Git + Node.js 20
    dnf update -y
    dnf install -y git nodejs20

    # Clone, build, and run backend
    cd /home/ec2-user
    git clone ${var.github_repo_url}
    cd ${var.github_backend_path}

    npm install
    npm run build
    nohup npm start &
  EOF

  tags = {
    Name = "${var.project_name}-ec2-instance"
  }
}
