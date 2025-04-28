# modules/rds/main.tf

data "aws_vpc" "default" {}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "this" {
  # lowercase the project name
  name       = "${lower(var.project_name)}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name    = "${lower(var.project_name)}-db-subnet-group"
    Project = var.project_name
  }
}

resource "aws_security_group" "rds" {
  name        = "${lower(var.project_name)}-rds-sg"
  description = "Allow PostgreSQL inbound"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${lower(var.project_name)}-rds-sg"
    Project = var.project_name
  }
}

resource "random_password" "rds" {
  length           = var.db_password_length
  special          = true
  override_special = "!#$%&*()_+-="
  min_lower        = 1
  min_upper        = 1
  min_numeric      = 1
  min_special      = 1
}

resource "aws_db_instance" "this" {
  identifier             = "${lower(var.project_name)}-db"
  engine                 = "postgres"
  engine_version         = "15.7"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  db_name                = var.db_name
  username               = var.db_username
  password               = "Csmajor!lums25"
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true
  skip_final_snapshot    = true

  tags = {
    Name    = "${lower(var.project_name)}-db"
    Project = var.project_name
  }
}
