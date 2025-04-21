variable "aws_region" {
  description = "AWS region to deploy in"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (free‑tier: t3.micro)"
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
  default     = "RaabtaNow/backend"
}
