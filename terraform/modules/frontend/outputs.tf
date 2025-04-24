output "bucket_id" {
  description = "Name of the S3 bucket serving your frontend"
  value       = aws_s3_bucket.this.id
}

output "website_endpoint" {
  description = "Static website URL for your frontend"
  value       = "http://${aws_s3_bucket.this.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}