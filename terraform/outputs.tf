# root/outputs.tf
output "backend_lb_dns_name" {
  description = "DNS name of your Application Load Balancer"
  value       = module.ec2_backend.backend_lb_dns_name
}

output "backend_url" {
  description = "HTTPS URL for your backend service"
  value       = module.ec2_backend.backend_url
  # value       = "http://${module.ec2_backend.backend_public_dns}:3000"
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

output "frontend_bucket" {
  description = "S3 bucket name for your frontend"
  value       = module.frontend.bucket_id
}

output "frontend_url" {
  value       = module.frontend.cloudfront_domain_name
  description = "CloudFront URL serving your frontend"
}

variable "backend_domain_name" {
  description = "The DNS name you want to serve your backend on (e.g. api.example.com)"
  type        = string
}

# Output the addresses ACM will email to:
output "certificate_validation_emails" {
  description = "ACM sent validation emails to these addresses — click the link to issue."
  value       = aws_acm_certificate.backend.domain_validation_options[*].validation_emails
}