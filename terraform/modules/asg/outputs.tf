# root/module/asg/outputs.tf
output "instance_sg_id" {
  description = "Instance SG for the ASG"
  value       = aws_security_group.instance.id
}

output "asg_name" {
  value       = aws_autoscaling_group.backend.name
  description = "Name of the backend ASG"
}
