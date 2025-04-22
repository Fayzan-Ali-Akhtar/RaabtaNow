# 1. User Pool
resource "aws_cognito_user_pool" "this" {
  name                     = var.user_pool_name
  auto_verified_attributes = var.auto_verified_attributes
  username_attributes = ["email"]

  # Allow *anyone* to sign up (not just admins)
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name    = "${var.project_name}-user-pool"
    Project = var.project_name
  }
}

# 2. App Client (supports sign-up & password flows)
resource "aws_cognito_user_pool_client" "app" {
  name         = "${var.project_name}-app-client"
  user_pool_id = aws_cognito_user_pool.this.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",    # allow username/password
    "ALLOW_USER_SRP_AUTH",         # allow SRP sign-in
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  generate_secret = false
}

# 3. Groups (recruiter & candidate)
resource "aws_cognito_user_group" "groups" {
  for_each     = toset(var.user_groups)
  name         = each.key
  user_pool_id = aws_cognito_user_pool.this.id
  description  = "${var.project_name} ${each.key} group"
}
