variable "project_name" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password_length" {
  type    = number
  default = 16
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.micro"  # free‑tier eligible
}

variable "db_allocated_storage" {
  type    = number
  default = 20            # free‑tier limit
}

variable "subnet_ids" { type = list(string) }  
variable "vpc_id"     { type = string }        

variable "db_password" {
  type        = string
  description = "Database password. If not provided, a random password will be generated."
  default     = "Csmajor!lums25" 
}