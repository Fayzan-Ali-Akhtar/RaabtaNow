# root/modules/ssm_parameters/variables.tf
variable "project_name" { type = string }

variable "parameters" {
  description = "Map of ENV-VAR-NAME => value to store in Parameter Store"
  type        = map(string)
}