data "aws_availability_zones" "available" {
  state = "available"
  filter {
    name   = "region-name"
    values = [var.aws_region]
  }
}

locals {
  public_cidrs = [for i in range(var.az_count) : cidrsubnet(var.cidr_block, 8, i)]
  app_cidrs    = [for i in range(var.az_count) : cidrsubnet(var.cidr_block, 8, i + 50)]
  data_cidrs   = [for i in range(var.az_count) : cidrsubnet(var.cidr_block, 8, i + 100)]
}

# 0️⃣ VPC + IGW
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.project_name}-igw" }
}

# 1️⃣ Subnets
resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.this.id
  cidr_block              = local.public_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project_name}-public-${count.index}"
    Tier = "public"
  }
}

resource "aws_subnet" "app" {
  count             = var.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = local.app_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project_name}-app-${count.index}"
    Tier = "app"
  }
}

resource "aws_subnet" "data" {
  count             = var.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = local.data_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project_name}-data-${count.index}"
    Tier = "data"
  }
}

# 2️⃣ NAT Gateways (one-per-AZ)
resource "aws_eip" "nat" {
  count = var.az_count
  domain = "vpc"
  tags  = { Name = "${var.project_name}-nat-eip-${count.index}" }
}

resource "aws_nat_gateway" "nat" {
  count         = var.az_count
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags          = { Name = "${var.project_name}-nat-${count.index}" }
}

# 3️⃣ Route tables
## public → IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "${var.project_name}-rtb-public" }
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

## app → NAT  (one RTB per AZ)

resource "aws_route_table" "app" {
  count  = var.az_count
  vpc_id = aws_vpc.this.id
  tags   = {
    Name = "${var.project_name}-rtb-app-${count.index}"
    Tier = "app"
  }
}

resource "aws_route" "app_nat" {
  count                  = var.az_count
  route_table_id         = aws_route_table.app[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  # nat_gateway_id         = aws_nat_gateway.nat[count.index].id
  gateway_id             = aws_internet_gateway.igw.id
  
  # depends_on             = [aws_nat_gateway.nat]
}

# ## data → IGW  (make data subnets public too)
resource "aws_route_table_association" "data_public" {
  count          = var.az_count
  subnet_id      = aws_subnet.data[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "app" {
  count          = var.az_count
  subnet_id      = aws_subnet.app[count.index].id
  route_table_id = aws_route_table.app[count.index].id
}

## data has NO default route – completely isolated

