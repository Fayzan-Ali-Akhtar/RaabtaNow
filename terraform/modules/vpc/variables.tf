variable "project_name"     { type = string }
variable "aws_region"       { type = string }
variable "cidr_block"       { 
    type = string  
default = "10.0.0.0/16" 
}
variable "az_count"         { 
    type = number  
default = 2 
}           # ≥2 AZs recommended
