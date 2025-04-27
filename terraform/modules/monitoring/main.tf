###########################
# 0) SNS topic + subscription
###########################
resource "aws_sns_topic" "alarm_topic" {
  name = "${var.project_name}-alarms"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alarm_topic.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

###########################
# 1) ALB alarms – 5xx spike + high latency
###########################
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${var.project_name}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 10
  evaluation_periods  = 1
  period              = 60
  statistic           = "Sum"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "HTTPCode_Target_5XX_Count"

  dimensions = {
    LoadBalancer = replace(var.alb_arn, "arn:aws:elasticloadbalancing:", "")   # CW wants the short name
  }

  alarm_description   = "More than 10 target-side 5xx errors in 1 min"
  treat_missing_data  = "notBreaching"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
}

resource "aws_cloudwatch_metric_alarm" "alb_latency" {
  alarm_name          = "${var.project_name}-alb-latency"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0.5                        # 500 ms p90
  evaluation_periods  = 2
  period              = 60
  statistic           = "Average"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "TargetResponseTime"

  dimensions = {
    LoadBalancer = replace(var.alb_arn, "arn:aws:elasticloadbalancing:", "")
  }

  alarm_description  = "ALB p90 latency > 500 ms for 2 minutes"
  treat_missing_data = "notBreaching"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]
}

###########################
# 2) ASG / EC2 alarms – CPU & scale-in protection
###########################
resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  alarm_name          = "${var.project_name}-ec2-cpu>80"
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 60
  evaluation_periods  = 2
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    AutoScalingGroupName = var.asg_name
  }

  alarm_description  = "Average CPU >80 % for 2 min in ASG"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]
  ok_actions         = [aws_sns_topic.alarm_topic.arn]
}

###########################
# 3) RDS alarms – CPU & free storage
###########################
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${var.project_name}-rds-cpu>80"
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  period              = 300
  evaluation_periods  = 2
  statistic           = "Average"
  threshold           = 80
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  alarm_description  = "RDS CPU >80 % for 10 min"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_free_storage_low" {
  alarm_name          = "${var.project_name}-rds-storage<1GiB"
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  period              = 300
  evaluation_periods  = 1
  statistic           = "Average"
  threshold           = 1 * 1024 * 1024 * 1024       # 1 GiB
  comparison_operator = "LessThanThreshold"

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }

  alarm_description  = "RDS free storage <1 GiB"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]
}

###########################
# 4) Optional: VPC Flow Logs → CW
###########################
resource "aws_cloudwatch_log_group" "vpc_flow" {
  name              = "/${var.project_name}/vpc-flow-logs"
  retention_in_days = 7                  # tweak as needed
}

resource "aws_flow_log" "all" {
  log_destination      = aws_cloudwatch_log_group.vpc_flow.arn
  log_destination_type = "cloud-watch-logs"
  traffic_type         = "ALL"
  vpc_id               = var.vpc_id                       # add var if you want this
  iam_role_arn         = aws_iam_role.flow.arn
}

# IAM role for flow-logs (only if you enabled flow-logs above)
resource "aws_iam_role" "flow" {
  name               = "${var.project_name}-flowlogs-role"
  assume_role_policy = data.aws_iam_policy_document.flow.json
}

data "aws_iam_policy_document" "flow" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { 
        type = "Service" 
        identifiers = ["vpc-flow-logs.amazonaws.com"] 
        }
  }
}
resource "aws_iam_role_policy_attachment" "flow" {
  role       = aws_iam_role.flow.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_flow_log" "vpc" {
  log_destination_type  = "cloud-watch-logs"
  log_destination       = aws_cloudwatch_log_group.vpc_flow.arn
  iam_role_arn          = aws_iam_role.flow.arn
  traffic_type          = "ALL"              # ACCEPT | REJECT | ALL
  vpc_id                = var.vpc_id
  max_aggregation_interval = 60             # seconds (shortest = 60)
  tags = {
    Name = "${var.project_name}-vpc-flow"
  }
}

