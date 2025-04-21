output "backend_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.backend.public_dns
}

output "backend_url" {
  description = "HTTP URL for your service"
  value       = "http://${aws_instance.backend.public_dns}:3000"
}
