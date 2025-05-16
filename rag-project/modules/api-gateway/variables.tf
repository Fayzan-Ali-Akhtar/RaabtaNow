variable "project_name" {
  description = "Project name prefix for resources."
  type        = string
}

variable "lambda_function_arn" {
  description = "ARN of the Lambda function."
  type        = string
}

variable "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function."
  type        = string
}

variable "tags" {
  description = "Tags for resources."
  type        = map(string)
}
