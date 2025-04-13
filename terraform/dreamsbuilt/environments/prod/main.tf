terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment this after applying remote-state.tf first
  # backend "s3" {
  #   bucket         = "dreamsbuilt-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "ap-southeast-2"
  #   profile        = "dreamsbuilt"
  #   dynamodb_table = "dreamsbuilt-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  profile = "dreamsbuilt"
  region  = var.aws_region

  default_tags {
    tags = {
      Project     = "DreamsBuilt"
      Environment = "prod"
      ManagedBy   = "Terraform"
    }
  }
}

# Create S3 bucket for file storage
module "files_bucket" {
  source      = "../../modules/s3"
  bucket_name = var.bucket_name
  environment = "prod"

  allowed_origins = [
    "https://dreamsbuilt.co.nz",
    "https://www.dreamsbuilt.co.nz"
  ]
}

# Create S3 bucket policy for CloudFront access
resource "aws_s3_bucket_policy" "files_bucket" {
  bucket = module.files_bucket.bucket_id
  policy = data.aws_iam_policy_document.s3_policy.json
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.files_bucket.bucket_arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [module.cloudfront.oai_iam_arn]
    }
  }
}

# Create CloudFront distribution for file access
module "cloudfront" {
  source             = "../../modules/cloudfront"
  bucket_name        = module.files_bucket.bucket_id
  bucket_domain_name = module.files_bucket.bucket_regional_domain_name
  environment        = "prod"
  distribution_name  = "DreamsBuilt Files CDN"

  # Use default CloudFront certificate for now
  domain_aliases          = []
  use_default_certificate = true
}