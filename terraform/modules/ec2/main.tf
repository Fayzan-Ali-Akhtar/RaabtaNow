# root/modules/ec2/main.tf
# 1. IAM Role & Profile for Session Manager
resource "aws_iam_role" "ssm_role" {
  name = "${var.project_name}-ec2-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  # Automatically detach managed policies on destroy
  force_detach_policies = true

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

# 2. EC2 Instance running Node.js 20 backend
resource "aws_instance" "this" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ssm_profile.name

  user_data = <<-EOF
    #!/bin/bash
    set -ex

    # 1) Logging all output
    exec > >(tee /home/ec2-user/app.log) 2>&1

    # 2) Update & install
    dnf update -y
    dnf install -y git nodejs20

    # 3) Clone your repo
    cd /home/ec2-user
    git clone ${var.github_repo_url}
    cd ${var.github_backend_path}

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

  tags = {
    Name = "${var.project_name}-ec2-instance"
  }
}

# now grant exactly the Cognito‐IDP rights your app needs:
resource "aws_iam_role_policy" "cognito_idp" {
  name = "${var.project_name}-ec2-cognito-idp"
  role = aws_iam_role.ssm_role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:SignUp",
          "cognito-idp:ConfirmSignUp",
          "cognito-idp:InitiateAuth",
          "cognito-idp:AdminAddUserToGroup"
        ]
        Resource = var.cognito_user_pool_arn
      },
      {
        Effect   = "Allow"
        Action   = "cognito-idp:AdminGetUser"
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# ────────────────────────────────────────────────────────────────────────────────
# 3) ACM Certificate (email validation) with toggleable destroy
# ────────────────────────────────────────────────────────────────────────────────

# a) “Keep” resource, created when destroy_acm = false
resource "aws_acm_certificate" "keep" {
  count                     = var.destroy_acm ? 0 : 1
  domain_name               = var.certificate_domain
  validation_method         = "EMAIL"
  subject_alternative_names = var.certificate_sans

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "${var.project_name}-alb-cert"
    Project = var.project_name
  }
}

# b) “Destroyable” resource, created when destroy_acm = true
resource "aws_acm_certificate" "del" {
  count                     = var.destroy_acm ? 1 : 0
  domain_name               = var.certificate_domain
  validation_method         = "EMAIL"
  subject_alternative_names = var.certificate_sans

  tags = {
    Name    = "${var.project_name}-alb-cert"
    Project = var.project_name
  }
}

# pick whichever ARN exists
locals {
  certificate_arn = var.destroy_acm ? aws_acm_certificate.del[0].arn : aws_acm_certificate.keep[0].arn
}

# single validation resource for whichever cert
resource "aws_acm_certificate_validation" "validation" {
  certificate_arn = local.certificate_arn

  # EMAIL validation emails are sent to:
  #  • WHOIS registrant / admin / tech contacts
  #  • + admin@, administrator@, webmaster@, hostmaster@, postmaster@<your-domain>
}

# ────────────────────────────────────────────────────────────────────────────────
# 4) Security Groups: ALB + EC2
# ────────────────────────────────────────────────────────────────────────────────
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  description = "Allow HTTP/HTTPS"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}

resource "aws_security_group" "instance_sg" {
  name        = "${var.project_name}-instance-sg"
  description = "Allow ALB→app & SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "App port from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
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

  tags = { Name = "${var.project_name}-instance-sg" }
}

# ────────────────────────────────────────────────────────────────────────────────
# 5) Load Balancer & Target Group
# ────────────────────────────────────────────────────────────────────────────────
resource "aws_lb" "this" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids

  tags = { Project = var.project_name }
}

resource "aws_lb_target_group" "this" {
  name     = "${var.project_name}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = { Project = var.project_name }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ────────────────────────────────────────────────────────────────────────────────
# 2) Self-signed cert via the TLS provider
# ────────────────────────────────────────────────────────────────────────────────
resource "tls_private_key" "alb_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "alb_cert" {
  # wait until the ALB exists so we know its DNS name
  depends_on = [aws_lb.this]

  private_key_pem = tls_private_key.alb_key.private_key_pem

  subject {
    common_name = aws_lb.this.dns_name
  }

  validity_period_hours = 8760
  is_ca_certificate     = false

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

# ────────────────────────────────────────────────────────────────────────────────
# 3) Import into ACM (no validation needed)
# ────────────────────────────────────────────────────────────────────────────────
resource "aws_acm_certificate" "imported" {
  depends_on = [tls_self_signed_cert.alb_cert]

  certificate_body  = tls_self_signed_cert.alb_cert.cert_pem
  private_key       = tls_private_key.alb_key.private_key_pem
  certificate_chain = ""

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "${var.project_name}-alb-cert"
    Project = var.project_name
  }
}

# ────────────────────────────────────────────────────────────────────────────────
# 4) HTTPS Listener using the imported cert
# ────────────────────────────────────────────────────────────────────────────────
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.imported.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

# ────────────────────────────────────────────────────────────────────────────────
# 6) Launch Template + Auto Scaling Group
# ────────────────────────────────────────────────────────────────────────────────
data "template_file" "user_data" {
  template = file("${path.module}/launch_user_data.sh.tpl")
  vars = {
    AWS_REGION           = var.aws_region
    GITHUB_REPO_URL      = var.github_repo_url
    GITHUB_BACKEND_PATH  = var.github_backend_path
    COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    COGNITO_CLIENT_ID    = var.cognito_client_id
    DB_ENDPOINT          = var.db_endpoint
    DB_PORT              = var.db_port
    DB_NAME              = var.db_name
    DB_USERNAME          = var.db_username
    DB_PASSWORD          = var.db_password
  }
}

resource "aws_launch_template" "this" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = var.ami_id
  instance_type = var.instance_type

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  network_interfaces {
    security_groups             = [aws_security_group.instance_sg.id]
    associate_public_ip_address = true
  }

  user_data = base64encode(data.template_file.user_data.rendered)

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name    = "${var.project_name}-ec2-instance"
      Project = var.project_name
    }
  }
}

resource "aws_autoscaling_group" "backend" {
  name                = "${var.project_name}-asg"
  max_size            = 3
  min_size            = 1
  desired_capacity    = 1
  vpc_zone_identifier = data.aws_subnets.default.ids

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  target_group_arns         = [aws_lb_target_group.this.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 120

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ec2-asg"
    propagate_at_launch = true
  }
}
