# variable "name_prefix" {
#   description = "Prefix for all resource names"
#   type        = string
# }

# variable "region" {
#   description = "AWS region"
#   type        = string
# }

# variable "knowledge_base_name" {
#   description = "Name of the Bedrock Knowledge Base"
#   type        = string
# }

# variable "embedding_model_id" {
#   description = "ID of the Bedrock embedding model"
#   type        = string
#   default     = "amazon.titan-embed-text-v2:0"
# }

# variable "vector_index_name" {
#   description = "Name of the vector index"
#   type        = string
#   default     = "vector_index"
# }

# variable "vector_field" {
#   description = "Name of the vector field"
#   type        = string
#   default     = "vector_field"
# }

# variable "text_field" {
#   description = "Name of the text field"
#   type        = string
#   default     = "text_field"
# }

# variable "metadata_field" {
#   description = "Name of the metadata field"
#   type        = string
#   default     = "metadata_field"
# }

# variable "vector_dimension" {
#   description = "Dimension of the vector"
#   type        = number
#   default     = 1024
# }

# variable "standby_replicas_enabled" {
#   description = "Whether to enable standby replicas for the OpenSearch Serverless collection"
#   type        = bool
#   default     = false
# }

# variable "data_sources" {
#   description = "List of data sources to attach to the knowledge base"
#   type = list(object({
#     name               = string
#     type               = string
#     bucket_arn         = string
#     inclusion_prefixes = optional(list(string))
#   }))
#   default = []
# }

# variable "data_source_buckets" {
#   description = "List of S3 bucket ARNs that the knowledge base should have access to"
#   type        = list(string)
#   default     = []
# }

# variable "additional_data_access_principals" {
#   description = "Additional principals that should have access to the OpenSearch Serverless data"
#   type        = list(string)
#   default     = []
# }

# variable "aws_region" {
#   description = "AWS Region to deploy resources"
#   type        = string
#   default     = "us-east-1"
# }