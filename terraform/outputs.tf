# root/outputs.tf
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

output "frontend_bucket" {
  description = "S3 bucket name for your frontend"
  value       = module.frontend.bucket_id
}

output "frontend_url" {
  value       = module.frontend.cloudfront_domain_name
  description = "CloudFront URL serving your frontend"
}

output "alb_dns_name" {
  description = "ALB DNS"
  value       = module.alb.alb_dns_name
}

output "alb_certificate_arn" {
  description = "Imported ACM cert ARN"
  value       = module.alb.certificate_arn
}

# output "backend_url" {
#   description = "HTTPS URL to backend"
#   value       = "https://${module.alb.alb_dns_name}"
# }
