terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "app_name" {
  default = "autonomous-ai-analyst"
}

# 1. ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "${var.app_name}-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.app_name}-frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

# 2. VPC & Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name   = "${var.app_name}-vpc"
  cidr   = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

# 3. ECS Fargate Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"
}

# 4. S3 Dataset Upload Bucket
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.app_name}-uploads-prod-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads_enc" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 5. Secrets Manager
resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.app_name}-production-secrets"
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "s3_bucket_name" {
  value = aws_s3_bucket.uploads.id
}
