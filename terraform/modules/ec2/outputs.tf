# root/modules/ec2/outputs.tf
output "backend_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.this.public_dns
}

output "backend_url" {
  description = "Full HTTP URL"
  value       = "http://${aws_instance.this.public_dns}:3000"
}
