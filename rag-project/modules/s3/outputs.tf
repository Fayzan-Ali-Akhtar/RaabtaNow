
output "bucket_name" {
  description = "Name of the S3 bucket created"
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  value = aws_s3_bucket.this.arn
}