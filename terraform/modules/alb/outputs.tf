# root/module/alb/outputs.tf
output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "ID of the ALB SG"
}

output "alb_dns_name" {
  value       = aws_lb.this.dns_name
  description = "DNS name of the ALB"
}

output "target_group_arn" {
  value       = aws_lb_target_group.tg.arn
  description = "Target Group ARN"
}

# output "alb_certificate_arn" {
#   value = module.alb.certificate_arn  # ← ERROR: module.alb has no such output
# }

output "certificate_arn" {
  description = "ARN of the ACM certificate attached to the ALB listener"
  # if your module variable is named aws_acm_certificate_arn:
  value = var.aws_acm_certificate_arn

  # OR, if you renamed the input variable to "certificate_arn":
  # value = var.certificate_arn
}

output "alb_arn" {
  description = "Full ARN of the ALB"
  value       = aws_lb.this.arn
}

output "alb_zone_id" {
  description = "Route 53 zone ID that belongs to the ALB DNS name"
  value       = aws_lb.this.zone_id
}
