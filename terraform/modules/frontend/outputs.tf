# root/module/frontend/outputs.tf
output "bucket_id" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.this.id
}

output "cloudfront_domain_name" {
  description = "HTTPS URL of your frontend"
  # prepend https:// if you like
  value = aws_cloudfront_distribution.this.domain_name
}