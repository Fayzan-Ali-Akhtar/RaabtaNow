# root/module/cognito/variables.tf
variable "project_name" {
  description = "Used to prefix all Cognito resources"
  type        = string
}

variable "user_pool_name" {
  description = "Cognito User Pool name"
  type        = string
}

variable "auto_verified_attributes" {
  description = "Attributes Cognito auto‑verifies"
  type        = list(string)
  default     = ["email"]
}

variable "user_groups" {
  description = "List of Cognito groups to create"
  type        = list(string)
}
