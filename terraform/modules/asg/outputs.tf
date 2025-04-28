# root/module/asg/outputs.tf
output "instance_sg_id" {
  description = "Instance SG for the ASG"
  value       = aws_security_group.instance.id
}
