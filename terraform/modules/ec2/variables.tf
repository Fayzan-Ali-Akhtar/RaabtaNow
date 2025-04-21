variable "ami_id" {
  description = "AMI ID to launch"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID to launch into"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repo URL"
  type        = string
}

variable "github_backend_path" {
  description = "Path inside the repo to the backend folder"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for naming resources"
  type        = string
  default     = "raabta-backend"
}
