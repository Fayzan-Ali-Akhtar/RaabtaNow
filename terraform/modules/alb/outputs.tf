output "alb_security_group_id" {
  description = "ID of the ALB SG"
  value       = aws_security_group.alb.id
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.this.dns_name
}

output "target_group_arn" {
  description = "Target Group ARN"
  value       = aws_lb_target_group.tg.arn
}

output "certificate_arn" {
  description = "Imported ACM certificate ARN"
  value       = aws_acm_certificate.imported.arn
}
