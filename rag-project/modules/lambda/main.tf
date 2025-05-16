resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = var.tags
}


resource "aws_iam_policy" "lambda_bedrock_policy" {
  name = "${var.project_name}-lambda-bedrock-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "InvokeModel"
        Effect = "Allow"
        Action = "bedrock:InvokeModel"
        Resource = var.model_arn
      },
      {
        Sid    = "QueryToKnowledgeBases"
        Effect = "Allow"
        Action = [
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate"
        ]
        Resource = [
          var.kb_arn
        ]
      }
    ]
  })
}




resource "aws_iam_role_policy_attachment" "attach_bedrock_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_bedrock_policy.arn
}




resource "aws_iam_policy" "lambda_logging_policy" {
  name = "${var.project_name}-lambda-logging-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "attach_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_logging_policy.arn
}

resource "aws_lambda_function" "api_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-lambda"
  handler          = "app.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_role.arn
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  tags = var.tags
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda_function"
  output_path = "${path.module}/lambda_function.zip"
}


resource "aws_sns_topic" "lambda_alerts" {
  name = "${var.project_name}-lambda-alerts"
}

resource "aws_sns_topic_subscription" "lambda_alerts_subscription" {
  topic_arn = aws_sns_topic.lambda_alerts.arn
  protocol  = "email"
  endpoint  = var.sub_email  
}



resource "aws_cloudwatch_metric_alarm" "lambda_error_alarm" {
  alarm_name                = "${var.project_name}-lambda-error-alarm"
  comparison_operator       = "GreaterThanThreshold"
  evaluation_periods        = 1
  metric_name               = "Errors"
  namespace                 = "AWS/Lambda"
  period                    = 60  # 1 minute
  statistic                 = "Sum"
  threshold                 = 1  # Trigger alarm if there is 1 or more error
  alarm_description         = "This alarm triggers if there is an error in the Lambda function"
  dimensions = {
    FunctionName = aws_lambda_function.api_lambda.function_name
  }

  alarm_actions = [aws_sns_topic.lambda_alerts.arn]

  ok_actions    = [aws_sns_topic.lambda_alerts.arn]  # Optional, action to take when the alarm goes back to OK
  insufficient_data_actions = [aws_sns_topic.lambda_alerts.arn]  # Optional, action for insufficient data
}

