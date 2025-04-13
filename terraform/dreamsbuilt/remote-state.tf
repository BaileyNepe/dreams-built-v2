provider "aws" {
  profile = "dreamsbuilt"
  region  = "ap-southeast-2"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "dreamsbuilt-terraform-state"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "DreamsBuilt Terraform State"
    Environment = "All"
    Terraform   = "true"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "dreamsbuilt-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "DreamsBuilt Terraform Lock Table"
    Environment = "All"
    Terraform   = "true"
  }
}

output "state_bucket_name" {
  value       = aws_s3_bucket.terraform_state.bucket
  description = "The name of the S3 bucket holding the Terraform state"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.terraform_locks.name
  description = "The name of the DynamoDB table for Terraform locks"
}