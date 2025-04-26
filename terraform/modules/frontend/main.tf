# root/modules/frontend/main.tf
# 1) S3 bucket (no website hosting here)
resource "aws_s3_bucket" "this" {
  bucket        = "${lower(var.project_name)}-frontend-${replace(var.aws_region,"-","")}"
  force_destroy = true

  tags = {
    Name    = "${var.project_name}-frontend"
    Project = var.project_name
  }
}

# 2) Block public ACLs but allow bucket policy
resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# 3) Build & deploy your Vite app
resource "local_file" "frontend_env" {
  filename = "${var.frontend_dir}/.env.production"
  content  = "VITE_BACKEND_URL=${var.backend_domain_name}\n"
}

resource "null_resource" "deploy" {
  depends_on = [ local_file.frontend_env ]
  triggers   = { redeploy = timestamp() }

  provisioner "local-exec" {
    working_dir = var.frontend_dir
    command     = "npm ci && npm run build && aws s3 sync dist/ s3://${aws_s3_bucket.this.bucket} --delete"
  }
}

# 4) CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.project_name}-frontend"
}

# 5) Only that OAI can GetObject
resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.this.arn}/*"
      }
    ]
  })
}

# 6) CloudFront Distribution
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CF distro for ${var.project_name}"
  price_class         = "PriceClass_100"
  default_root_object = "index.html"                # ← serve index.html at /

 # Static files origin
origin {
  origin_id   = "s3-origin"
  domain_name = aws_s3_bucket.this.bucket_regional_domain_name

  s3_origin_config {
    origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
  }
}

# API origin (your ALB DNS, HTTP-only)
origin {
  origin_id   = "api-origin"
  domain_name = var.backend_domain_name

  custom_origin_config {
    origin_protocol_policy = "http-only"
    http_port              = 80
    https_port             = 443
    origin_ssl_protocols   = ["TLSv1.2"]
  }
}

  default_cache_behavior {
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

# anything under /api/ → proxy to your ALB over HTTP
  ordered_cache_behavior {
    path_pattern            = "/api/*"
    target_origin_id        = "api-origin"
    viewer_protocol_policy  = "redirect-to-https"

    allowed_methods = ["GET","HEAD","OPTIONS","PUT","POST","PATCH","DELETE"]
    cached_methods  = ["GET","HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["Authorization","Content-Type"]   # if you need auth
      cookies {
        forward = "all"
      }
    }
  }

  # catch-all 403 → index.html (so client‐side routes load)
  custom_error_response {
    error_code            = 403
    response_page_path    = "/index.html"
    response_code         = 200
    error_caching_min_ttl = 0
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  tags = {
    Project = var.project_name
  }
}