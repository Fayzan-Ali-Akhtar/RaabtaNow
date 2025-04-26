# modules/frontend/variables.tf
variable "project_name" {
  type        = string
  description = "Used to prefix all resources"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "frontend_dir" {
  type        = string
  description = "Local path to your frontend project"
}

variable "backend_domain_name" {
  type        = string
  description = "The DNS name of your HTTP-only ALB (e.g. module.ec2_backend.backend_lb_dns_name)"
}
