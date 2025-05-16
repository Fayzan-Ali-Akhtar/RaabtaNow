output "lambda_function_arn" {
  value = aws_lambda_function.api_lambda.arn
}

output "lambda_function_name" {
  value = aws_lambda_function.api_lambda.function_name
}


output "lambda_function_invoke_arn" {
  value = aws_lambda_function.api_lambda.invoke_arn
}