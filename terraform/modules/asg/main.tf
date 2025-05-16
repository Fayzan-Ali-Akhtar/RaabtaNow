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

###############################################################################
# IAM: allow reading the single Secrets Manager secret
###############################################################################
data "aws_iam_policy_document" "secrets_read" {
  statement {
    sid    = "ReadBackendEnvSecret"
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
    ]

    resources = [ var.secret_arn ]
  }
}

resource "aws_iam_policy" "secrets_read" {
  name        = "${var.project_name}-secrets-read"
  description = "Read-only access to backend env secret"
  policy      = data.aws_iam_policy_document.secrets_read.json
}

resource "aws_iam_role_policy_attachment" "secrets_read" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = aws_iam_policy.secrets_read.arn
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
    dnf install -y git nodejs20 awscli jq

    # 3) Clone your repo (only the specified branch)
    cd /home/ec2-user
    git clone \
      --branch ${var.github_repo_branch} \
      --single-branch \
      ${var.github_repo_url} repo
    cd repo/${var.github_backend_path}

    # 4) Retrieve backend-env from Secrets Manager
    aws secretsmanager get-secret-value \
      --secret-id ${var.secret_arn} \
      --region ${var.aws_region} \
      --query SecretString \
      --output text > secret.json

    # 5) Parse and export each variable
    export DB_USERNAME=$(jq -r .DB_USERNAME secret.json)
    export DB_PASSWORD=$(jq -r .DB_PASSWORD secret.json)
    export DB_ENDPOINT=$(jq -r .DB_ENDPOINT secret.json)
    export DB_NAME=$(jq -r .DB_NAME secret.json)
    export COGNITO_USER_POOL_ID=$(jq -r .COGNITO_USER_POOL_ID secret.json)
    export COGNITO_CLIENT_ID=$(jq -r .COGNITO_CLIENT_ID secret.json)
    export AWS_REGION=${var.aws_region}

    # 6) Write .env file for the backend
    cat > .env <<EOL
    DB_USERNAME=$DB_USERNAME
    DB_PASSWORD=$DB_PASSWORD
    DB_ENDPOINT=$DB_ENDPOINT
    DB_NAME=$DB_NAME
    COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID
    COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
    AWS_REGION=$AWS_REGION
    EOL

    # 7) Build & start
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
