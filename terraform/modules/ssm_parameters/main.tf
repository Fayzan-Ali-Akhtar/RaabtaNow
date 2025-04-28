# root/module/ssm_parameters/main.tf
# one SSM parameter per entry in the map
resource "aws_ssm_parameter" "env" {
  for_each = var.parameters

  name  = "/${var.project_name}/${each.key}"   # e.g. /RaabtaNow-Fayzan/DB_NAME
  type  = each.key == "DB_PASSWORD" ? "SecureString" : "String"
  value = each.value

  tags = {
    Project = var.project_name
  }
}
