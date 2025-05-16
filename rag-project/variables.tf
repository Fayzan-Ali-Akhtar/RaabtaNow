variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix for naming all resources"
  type        = string
  default     = "my-project"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Owner       = "Ali Haris"
  }
}


# variable "agent_name" {
#   description = "The name of the agent"
#   type        = string
# }

# variable "action_group_name" {
#   description = "The action group name for the IAM role"
#   type        = string
# }

variable "kb_name" {
  description = "The name of the knowledge base."
  type        = string
  default     = "sample"
}


variable "kb_s3_bucket_name_prefix" {
  description = "The name prefix of the S3 bucket for the data source of the knowledge base."
  type        = string
  default     = "knowledge-base-company-data-bucket"
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket to be created"
  default     = "my-rag-bucket-1234567890" # Change this to a unique name
}

