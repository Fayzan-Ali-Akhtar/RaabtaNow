# root/module/asg/variables.tf
variable "project_name"         { type = string }
variable "aws_region"           { type = string }
variable "vpc_id"               { type = string }
variable "subnet_ids"           { type = list(string) }
variable "ami_id"               { type = string }
variable "instance_type"        { type = string }

variable "github_repo_url"      { type = string }
variable "github_backend_path"  { type = string }

variable "cognito_user_pool_id" { type = string }
variable "cognito_client_id"    { type = string }

variable "db_endpoint"          { type = string }
variable "db_port"              { type = number }
variable "db_name"              { type = string }
variable "db_username"          { type = string }
variable "db_password"          { type = string }

variable "alb_sg_id"            { type = string }
variable "target_group_arn"     { type = string }

variable "github_repo_branch"   { type = string }
