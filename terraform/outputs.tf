output "backend_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.ec2_backend.backend_public_dns
}

output "backend_url" {
  description = "HTTP URL for your service"
  value       = "http://${module.ec2_backend.backend_public_dns}:3000"
}

output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = module.cognito.user_pool_arn
}

output "cognito_app_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = module.cognito.user_pool_client_id
}
