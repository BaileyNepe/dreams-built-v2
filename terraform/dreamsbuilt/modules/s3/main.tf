resource "aws_s3_bucket" "files_bucket" {
  bucket = var.bucket_name

  tags = {
    Name        = var.bucket_tags.Name
    Environment = var.environment
    Terraform   = "true"
  }
}

# Configure bucket ACL
resource "aws_s3_bucket_ownership_controls" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for file history and protection
resource "aws_s3_bucket_versioning" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption for all objects
resource "aws_s3_bucket_server_side_encryption_configuration" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Configure intelligent tiering (moves objects to more cost-effective storage tiers)
resource "aws_s3_bucket_intelligent_tiering_configuration" "files_tiering" {
  bucket = aws_s3_bucket.files_bucket.id
  name   = "EntireBucket"

  status = "Enabled"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# Add bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "cloudfront_access_policy" {
  bucket = aws_s3_bucket.files_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.files_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = var.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}

# Configure lifecycle rules for object management
resource "aws_s3_bucket_lifecycle_configuration" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  # Expire non-current (previous versions) after 90 days
  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {
      prefix = "" # Apply to all objects
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  # Move objects to Standard-IA after 30 days
  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    filter {
      prefix = "" # Apply to all objects
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }
}

# CORS configuration to allow uploads from the web app
resource "aws_s3_bucket_cors_configuration" "files_bucket" {
  bucket = aws_s3_bucket.files_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}