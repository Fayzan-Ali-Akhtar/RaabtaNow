locals {
  name = var.project_name
}

#
#  ─── SECURITY GROUPS ───────────────────────────────────────────────────────────
#

# ALB SG: allow 80/443 from anywhere
resource "aws_security_group" "alb" {
  name        = "${local.name}-alb-sg"
  description = "Allow HTTP from anywhere"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-alb-sg" }
}

# Instance SG: allow 22 from anywhere, 3000 only from ALB
resource "aws_security_group" "instance" {
  name        = "${local.name}-instance-sg"
  description = "SSH + app port"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [ aws_security_group.alb.id ]
  }
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-instance-sg" }
}

#
# ─── ALB + Target Group + HTTP Listener ─────────────────────────────────────
#

resource "aws_lb" "this" {
  name               = "${local.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [ aws_security_group.alb.id ]
  subnets            = var.subnet_ids
  tags = { Project = local.name }
}

# Target group pointing at port 3000 on the instances
resource "aws_lb_target_group" "this" {
  name     = "${local.name}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = { Project = local.name }
}

# HTTP listener: redirect to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

# ─── IAM for SSM / EC2 bootstrap ──────────────────────────────────────────

resource "aws_iam_role" "ssm" {
  name               = "${local.name}-ssm-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
  force_detach_policies = true
  tags = { Name = "${local.name}-ssm-role" }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm" {
  name = "${local.name}-ssm-profile"
  role = aws_iam_role.ssm.name
}

# Forge a launch template for your backend
resource "aws_launch_template" "this" {
  name_prefix   = "${local.name}-lt-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm.name
  }

  network_interfaces {
    security_groups = [ aws_security_group.instance.id ]
  }

  user_data = <<-EOF
    #!/bin/bash
    set -ex

    # log to ec2-user/app.log
    exec > >(tee /home/ec2-user/app.log) 2>&1

    # update & install
    dnf update -y
    dnf install -y git nodejs20

    cd /home/ec2-user
    git clone ${var.github_repo_url} repo
    cd repo/${var.github_backend_path}

    cat > .env << EOL
    AWS_REGION=${var.aws_region}
    COGNITO_USER_POOL_ID=${var.cognito_user_pool_id}
    COGNITO_CLIENT_ID=${var.cognito_client_id}
    DB_ENDPOINT=${var.db_endpoint}
    DB_PORT=${var.db_port}
    DB_NAME=${var.db_name}
    DB_USERNAME=${var.db_username}
    DB_PASSWORD=${var.db_password}
    EOL

    npm install
    npm run build
    nohup npm start &
  EOF
}

# Auto-Scale between 1 and 2 instances
resource "aws_autoscaling_group" "this" {
  name_prefix        = "${local.name}-asg-"
  max_size           = 2
  min_size           = 1
  desired_capacity   = 1
  vpc_zone_identifier = var.subnet_ids

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  target_group_arns = [ aws_lb_target_group.this.arn ]

  tag {
    key                 = "Name"
    value               = "${local.name}-backend"
    propagate_at_launch = true
  }
}

