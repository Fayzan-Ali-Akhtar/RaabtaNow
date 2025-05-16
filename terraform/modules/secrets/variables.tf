variable "project_name" { type = string }

variable "parameters" {                       # identical to the old SSM map
  description = "Env-var map that ends up inside the secret"
  type        = map(string)
}
