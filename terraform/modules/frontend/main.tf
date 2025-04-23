# root/modules/frontend/main.tf
# 1. Public S3 bucket with website hosting
resource "aws_s3_bucket" "this" {
  bucket = "${lower(var.project_name)}-frontend-${var.aws_region}"

  tags = {
    Name    = "${var.project_name}-frontend"
    Project = var.project_name
  }
}

# # new, recommended ACL resource:
# resource "aws_s3_bucket_acl" "this" {
#   bucket = aws_s3_bucket.this.id
#   acl    = "public-read"
# }

# new, non-deprecated website config:
resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

# 2. Allow public read on the bucket’s objects
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "public_read" {
  statement {
    sid    = "PublicRead"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.public_read.json
}

# 3. Build & deploy your Vite app (runs on the machine doing `terraform apply`)
resource "null_resource" "deploy" {
  triggers = {
    redeploy = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.frontend_dir
    # single-line command so cmd.exe understands the && correctly
    command     = "npm ci && npm run build && aws s3 sync dist/ s3://${aws_s3_bucket.this.bucket} --delete"
  }
}

