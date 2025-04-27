variable "project_name" {
  description = "Project name prefix for resources."
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}
