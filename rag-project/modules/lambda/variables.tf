variable "project_name" {
  description = "Project name prefix for resources."
  type        = string
  default     = "rag-project"
}

variable "tags" {
  description = "Tags to apply to all resources."
  type        = map(string)
}


variable "model_arn" {
  description = "The ARN of the Bedrock model to use."
  type        = string
  default =  "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0"
  
}

variable "kb_arn" {
  description = "The ARN of the Bedrock model to use."
  type        = string
  default =  "arn:aws:bedrock:us-east-1:619071351543:knowledge-base/FF9IEMBXVE"
  
}


variable "sub_email" {
  description = "The ARN of the Bedrock model to use."
  type        = string
  default =  "26100133@lums.edu.pk"
}





