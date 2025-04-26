# root/modules/ec2/outputs.tf
output "backend_lb_dns_name" {
  description = "DNS name of the ALB (HTTPS endpoint)"
  value       = aws_lb.this.dns_name
}

output "backend_url" {
  description = "HTTPS url to your backend"
  value       = "https://${aws_lb.this.dns_name}"
}

