# modules/asg/main.tf

###########
# 0) SSM IAM Role & Profile (for EC2 Session Manager)
###########
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
  force_detach_policies = true

  tags = {
    Name = "${var.project_name}-ec2-ssm-role"
  }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

// grant Cognito-IDP power-user abilities to the EC2 role
resource "aws_iam_role_policy_attachment" "ssm_cognito_power_user" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "${var.project_name}-ec2-ssm-profile"
  role = aws_iam_role.ssm_role.name

  tags = {
    Name = "${var.project_name}-ec2-ssm-profile"
  }
}

# 1) Instance Security Group
resource "aws_security_group" "instance" {
  name        = "${var.project_name}-instance-sg"
  description = "Allow ALB app & SSH"
  vpc_id      = var.vpc_id

  ingress {
    description     = "App port from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
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
    Name = "${var.project_name}-instance-sg"
  }
}

resource "aws_iam_role_policy_attachment" "ssm_cloudwatch_logs" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/${var.project_name}/backend"
  retention_in_days = 7
}

# 2) Launch Template with inline user_data
resource "aws_launch_template" "this" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  network_interfaces {
    security_groups             = [aws_security_group.instance.id]
    associate_public_ip_address = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -ex

    # 1) Logging
    exec > >(tee /home/ec2-user/app.log) 2>&1

    # 2) Update & install
    dnf update -y
    dnf install -y git nodejs20

    # 3) Clone your repo (only the specified branch)
    cd /home/ec2-user
    git clone \
      --branch ${var.github_repo_branch} \
      --single-branch \
      ${var.github_repo_url} repo
    cd repo/${var.github_backend_path}

    # 4) Write .env in the backend folder
    cat > .env <<EOL
    AWS_REGION=${var.aws_region}
    COGNITO_USER_POOL_ID=${var.cognito_user_pool_id}
    COGNITO_CLIENT_ID=${var.cognito_client_id}
    DB_ENDPOINT=${var.db_endpoint}
    DB_PORT=${var.db_port}
    DB_NAME=${var.db_name}
    DB_USERNAME=${var.db_username}
    DB_PASSWORD=${var.db_password}
    EOL

    # 5) Build & start
    npm install
    npm run build
    nohup npm start &
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name    = "${var.project_name}-ec2-instance"
      Project = var.project_name
    }
  }
}

# 3) Auto Scaling Group
resource "aws_autoscaling_group" "backend" {
  name                = "${var.project_name}-asg"
  vpc_zone_identifier = var.subnet_ids
  desired_capacity    = 1
  min_size            = 1
  max_size            = 3

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  target_group_arns         = [var.target_group_arn]
  health_check_type         = "ELB"
  health_check_grace_period = 120

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ec2-asg"
    propagate_at_launch = true
  }
}