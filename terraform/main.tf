provider "aws" {
  region = "us-east-1"
}

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Effect = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda: login
resource "aws_lambda_function" "login" {
  function_name    = "auth-login"
  filename         = "${path.module}/../login.zip"
  handler          = "login.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256("${path.module}/../login.zip")

  environment {
    variables = {
      DATABASE_URL = "postgres://user:password@54.198.5.104:5432/auth_db"
      JWT_SECRET   = "your_jwt_secret"
    }
  }
}

# Lambda: signup
resource "aws_lambda_function" "signup" {
  function_name    = "auth-signup"
  filename         = "${path.module}/../signup.zip"
  handler          = "signup.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256("${path.module}/../signup.zip")

  environment {
    variables = {
      DATABASE_URL = "postgres://user:password@54.198.5.104:5432/auth_db"
      JWT_SECRET   = "your_jwt_secret"
    }
  }
}

# Lambda: health check
resource "aws_lambda_function" "health" {
  function_name = "auth-health"
  filename      = "${path.module}/../health.zip"
  handler       = "health.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256("${path.module}/../health.zip")

  environment {
    variables = {
      DATABASE_URL = "postgres://user:password@54.198.5.104:5432/auth_db"
    }
  }
}

# HTTP API
resource "aws_apigatewayv2_api" "http_api" {
  name          = "auth-api"
  protocol_type = "HTTP"
}

# Integrations
resource "aws_apigatewayv2_integration" "login_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.login.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "signup_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.signup.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "health_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.health.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# Routes
resource "aws_apigatewayv2_route" "login_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /login"
  target    = "integrations/${aws_apigatewayv2_integration.login_integration.id}"
}

resource "aws_apigatewayv2_route" "signup_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /signup"
  target    = "integrations/${aws_apigatewayv2_integration.signup_integration.id}"
}

resource "aws_apigatewayv2_route" "health_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.health_integration.id}"
}

# Allow API Gateway to invoke Lambda
resource "aws_lambda_permission" "allow_api_gateway_login" {
  statement_id  = "AllowExecutionFromAPIGatewayLogin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_signup" {
  statement_id  = "AllowExecutionFromAPIGatewaySignup"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.signup.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_health" {
  statement_id  = "AllowExecutionFromAPIGatewayHealth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# Deploy stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}
