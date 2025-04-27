resource "aws_iam_role" "lambda_role" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["bedrock:Retrieve", "bedrock:InvokeAgent"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${var.s3_bucket_arn}/*"
      }
    ]
  })
}

resource "aws_lambda_function" "cover_letter_lambda" {
  filename         = "${path.module}/../../lambda/lambda.zip"
  function_name    = "coverLetterLambda"
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      KNOWLEDGE_BASE_ID = var.knowledge_base_id
    }
  }
}
