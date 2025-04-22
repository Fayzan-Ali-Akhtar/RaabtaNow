# terraform/modules/ec2/variables.tf

variable "project_name" {
  description = "Name of the project, used to prefix resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy in"
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

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "cognito_client_id" {
  description = "ID of the Cognito App Client"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool (for inline policy)"
  type        = string
}
