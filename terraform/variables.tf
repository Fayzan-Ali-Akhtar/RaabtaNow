# root/variables.tf
variable "project_name" {
  description = "Name of the project (used to prefix resources)"
  type        = string
  default     = "RaabtaNow"
}

variable "aws_region" {
  description = "AWS region to deploy in"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (free‑tier: t2.micro)"
  type        = string
  default     = "t2.micro"
}

variable "github_repo_url" {
  description = "HTTPS URL of the GitHub repository"
  type        = string
  default     = "https://github.com/Fayzan-Ali-Akhtar/RaabtaNow.git"
}

variable "github_backend_path" {
  description = "Path inside the cloned repo to the backend folder"
  type        = string
  default     = "backend"
}

variable "db_name" {
  description = "Initial database name (must be lowercase)"
  type        = string
  default     = "raabta"
}

variable "db_username" {
  description = "RDS master username (must be lowercase)"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "RDS master username (must be lowercase)"
  type        = string
  default     = "Csmajor!lums25"
}

#  variable for the branch name
variable "github_repo_branch" {
  description = "Which branch of the GitHub repo to clone"
  type        = string
  default     = "cloudwatch-terraform"
}

variable "alarm_phone_number" {
  description = "Phone number to receive CloudWatch alarm notifications"
  type        = string
  default     = "+923204795636" 
}

variable "developer_name" {
  description = "Name of the developer (used to prefix resources)"
  type        = string
  default     = "Fayzan"
}