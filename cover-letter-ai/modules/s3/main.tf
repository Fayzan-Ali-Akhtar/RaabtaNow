resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "company_data" {
  bucket = "${var.bucket_name}-${random_id.suffix.hex}"
  force_destroy = true

  tags = {
    Project = "Cover Letter AI"
  }
}

resource "aws_s3_object" "sample_data" {
  bucket = aws_s3_bucket.company_data.id
  key    = "google.txt"
  content = "Google is a leading technology company focused on search engines, cloud computing, and advertising technologies."
  content_type = "text/plain"
}
