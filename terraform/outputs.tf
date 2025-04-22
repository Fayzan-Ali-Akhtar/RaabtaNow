# root/outputs.tf
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

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
}

output "db_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "db_name" {
  description = "Initial database"
  value       = module.rds.db_name
}

output "db_username" {
  description = "RDS master username"
  value       = module.rds.username
}

output "db_password" {
  description = "RDS master password"
  value       = module.rds.password
  sensitive   = true
}