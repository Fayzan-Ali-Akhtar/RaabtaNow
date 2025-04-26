# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Allow HTTP/HTTPS"
  vpc_id      = var.vpc_id

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
    from_port=0 
    to_port=0
     protocol="-1"
      cidr_blocks=["0.0.0.0/0"] 
}

  tags = { Name = "${var.project_name}-alb-sg" }
}

# ALB + Target Group
resource "aws_lb" "this" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.subnet_ids
  tags               = { Project = var.project_name }
}

resource "aws_lb_target_group" "tg" {
  name     = "${var.project_name}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = { Project = var.project_name }
}

# HTTP → HTTPS redirect
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
# Self-signed TLS + import to ACM
# ────────────────────────────────────────────────────────────────────────────────
resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_self_signed_cert" "cert" {
  depends_on           = [aws_lb.this]
  private_key_pem      = tls_private_key.key.private_key_pem
  subject { common_name = aws_lb.this.dns_name }
  allowed_uses         = ["key_encipherment","digital_signature","server_auth"]
  validity_period_hours = 8760
  is_ca_certificate     = false
}

resource "aws_acm_certificate" "imported" {
  depends_on       = [tls_self_signed_cert.cert]
  certificate_body = tls_self_signed_cert.cert.cert_pem
  private_key      = tls_private_key.key.private_key_pem

#   lifecycle { prevent_destroy = true }

  tags = {
    Name    = "${var.project_name}-alb-cert"
    Project = var.project_name
  }
}

# HTTPS listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.imported.arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}
