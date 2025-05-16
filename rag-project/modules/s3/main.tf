# S3 bucket for the knowledge base
#tfsec:ignore:aws-s3-enable-bucket-logging
resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = true
}


resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}


# Upload Files to S3 Bucket
resource "aws_s3_object" "company_files" {
  count   = 1  
  bucket  = aws_s3_bucket.this.id
  key     = "companies_profiles.pdf"  
  source  = "files/companies_profiles.pdf"  
  acl     = "private"
}


