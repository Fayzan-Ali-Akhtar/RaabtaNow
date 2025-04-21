output "backend_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.ec2_backend.backend_public_dns
}

output "backend_url" {
  description = "HTTP URL for your service"
  value       = "http://${module.ec2_backend.backend_public_dns}:3000"
}
