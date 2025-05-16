terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    awscc = {
      source  = "hashicorp/awscc"
      version = "~> 1.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.0"
    }
  }
}

# First declare all modules that create resources
module "s3_bucket" {
  source      = "./modules/s3"
  bucket_name = var.kb_s3_bucket_name_prefix
}

module "lambda" {
  source = "./modules/lambda"
  project_name = var.project_name
  tags = {
    Project = var.project_name
    Environment = "dev"
  }
}

module "api_gateway" {
  source = "./modules/api-gateway"
  project_name = var.project_name
  lambda_function_arn = module.lambda.lambda_function_arn
  lambda_function_invoke_arn = module.lambda.lambda_function_invoke_arn
  tags = {
    Project = var.project_name
    Environment = "dev"
  }
}

# module "bedrock_knowledge_base" {
#   source = "./modules/bedrock-knowledge-base"
#   name_prefix         = "test"
#   region              = var.aws_region
#   knowledge_base_name = "test-kb"
  
#   data_sources = [{
#     name       = "test-s3-001"
#     type       = "S3"
#     bucket_arn = module.s3_bucket.bucket_arn 
#   }]
  
#   data_source_buckets = [module.s3_bucket.bucket_arn]
# }

# Then declare the OpenSearch provider using the module's output
# provider "opensearch" {
#   url         = module.bedrock_knowledge_base.opensearch_endpoint
#   aws_region  = var.aws_region
#   healthcheck = false
# }