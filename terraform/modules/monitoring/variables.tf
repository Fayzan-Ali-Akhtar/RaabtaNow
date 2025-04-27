# root/modules/monitoring/variables.tf
variable "project_name"      { type = string }
variable "alb_arn"           { type = string }
variable "asg_name"          { type = string }
variable "rds_instance_id"   { type = string }
variable "alarm_email" {                  
  type        = string
  description = "Address to receive CloudWatch alarm notifications"
}
variable "vpc_id" {
  type        = string
  description = "ID of the VPC to monitor (required if flow logs enabled)"
  default     = ""
}
