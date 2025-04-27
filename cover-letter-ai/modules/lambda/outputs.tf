output "lambda_function_arn" {
  value = aws_lambda_function.cover_letter_lambda.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.cover_letter_lambda.function_name
}
