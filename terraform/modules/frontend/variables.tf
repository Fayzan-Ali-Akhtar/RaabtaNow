# root/module/frontend/variables.tf
variable "project_name" {
  description = "Used to name the S3 bucket"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "frontend_dir" {
  description = "Absolute path to the local frontend folder"
  type        = string
}

variable "backend_url" {
  description = "The HTTP URL for our deployed backend"
  type        = string
}
