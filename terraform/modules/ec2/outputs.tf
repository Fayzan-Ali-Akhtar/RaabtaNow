# root/modules/ec2/outputs.tf
output "backend_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.this.public_dns
}

output "backend_url" {
  description = "Full HTTP URL"
  value       = "http://${aws_instance.this.public_dns}:3000"
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.this.dns_name
}

output "alb_certificate_arn" {
  description = "ARN of the imported ACM certificate"
  value       = aws_acm_certificate.imported.arn
}