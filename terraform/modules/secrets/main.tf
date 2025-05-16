###############################################################################
# 1) Secret metadata
###############################################################################
locals {
  # grab "2025-04-28T15:34:00Z" then reformat into "20250428-153400"
  current_time_and_date = formatdate("YYYYMMDD-hhmmss", timestamp())
}

resource "aws_secretsmanager_secret" "backend_env" {
  name        = "${var.project_name}/backend-env-${local.current_time_and_date}"         # e.g. RaabtaNow-Fayzan-testing/backend-env
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
