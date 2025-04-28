variable "project_name" { type = string }
variable "vpc_id"       { type = string }
variable "subnet_ids"   { type = list(string) }


variable "aws_acm_certificate_arn" {
  description = "ARN of the ACM certificate to attach to the ALB HTTPS listener"
  type        = string
}
