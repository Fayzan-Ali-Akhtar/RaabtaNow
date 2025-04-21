variable "project_name" {
  description = "Name of the project, used to prefix resources"
  type        = string
}

variable "ami_id" {
  description = "AMI ID to launch"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where resources will be launched"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repo URL containing the backend code"
  type        = string
}

variable "github_backend_path" {
  description = "Path inside the cloned repo to the backend folder"
  type        = string
}
