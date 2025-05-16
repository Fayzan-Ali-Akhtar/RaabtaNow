terraform {
  required_version = ">= 1.2.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # backend "s3" {
  #   bucket = "cloud-dev-project-backup"                     # ← your bucket name
  #   key    = "raabtanow/terraform.tfstate"     # path inside the bucket
  #   region = "us-east-1"                       # bucket’s region
  #   encrypt = true                             # SSE-S3
  # }
}


provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = var.project_name
    }
  }
}

provider "local" {} # nothing to configure
provider "tls" {}