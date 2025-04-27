output "api_gateway_url" {
  value = module.api_gateway.api_endpoint
}


output "lambda_function_arn" {
  value = module.lambda.lambda_function_arn
}

output "lambda_function_invoke_arn" {
  value = module.lambda.lambda_function_invoke_arn
  
}

output "s3_bucket_name" {
  value = module.s3_bucket.bucket_name
}

output "s3_bucket_arn" {
  value = module.s3_bucket.bucket_arn
}