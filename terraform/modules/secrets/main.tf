###############################################################################
# 1) Secret metadata
###############################################################################
resource "aws_secretsmanager_secret" "backend_env" {
  name        = "${var.project_name}/backend-env"         # e.g. RaabtaNow-Fayzan-testing/backend-env
  description = "All backend environment variables"

  tags = {
    Project = var.project_name
  }
}

###############################################################################
# 2) Secret value – store the map as a JSON string
###############################################################################
resource "aws_secretsmanager_secret_version" "backend_env_v1" {
  secret_id     = aws_secretsmanager_secret.backend_env.id
  secret_string = jsonencode(var.parameters)              # 👈 marshal map → JSON
}

###############################################################################
# 3) Export ARN so callers (ASG) can grant access
###############################################################################
output "secret_arn" {
  value = aws_secretsmanager_secret.backend_env.arn
}
