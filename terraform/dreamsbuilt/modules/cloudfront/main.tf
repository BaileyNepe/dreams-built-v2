resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.bucket_name}"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = var.bucket_domain_name
    origin_id   = "S3-${var.bucket_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_All" # Using standard price class
  http_version        = "http2"

  aliases = var.domain_aliases

  # Default cache behavior for most files
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id            = aws_cloudfront_cache_policy.optimized_policy.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.s3_policy.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  # Ordered cache behavior for document files (PDF, etc.)
  ordered_cache_behavior {
    path_pattern     = "*.pdf"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.document_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  # Ordered cache behavior for images - fixed pattern to avoid invalid characters
  ordered_cache_behavior {
    path_pattern     = "*.jpg"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  # Additional image formats with separate path patterns
  ordered_cache_behavior {
    path_pattern     = "*.jpeg"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  ordered_cache_behavior {
    path_pattern     = "*.png"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  ordered_cache_behavior {
    path_pattern     = "*.gif"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  ordered_cache_behavior {
    path_pattern     = "*.webp"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  ordered_cache_behavior {
    path_pattern     = "*.svg"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${var.bucket_name}"
    compress         = true

    cache_policy_id          = aws_cloudfront_cache_policy.image_policy.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.s3_policy.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day
    max_ttl                = 31536000 # 1 year
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.use_default_certificate
    acm_certificate_arn            = var.use_default_certificate ? null : var.acm_certificate_arn
    ssl_support_method             = var.use_default_certificate ? null : "sni-only"
    minimum_protocol_version       = var.use_default_certificate ? "TLSv1" : "TLSv1.2_2021"
  }

  tags = {
    Name        = var.distribution_name
    Environment = var.environment
    Terraform   = "true"
  }
}

# Cache policies for different content types
resource "aws_cloudfront_cache_policy" "optimized_policy" {
  name        = "${var.environment}-dreamsbuilt-optimized-policy"
  comment     = "Default cache policy for DreamsBuilt content"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "document_policy" {
  name        = "${var.environment}-dreamsbuilt-document-policy"
  comment     = "Cache policy for document files like PDFs"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "image_policy" {
  name        = "${var.environment}-dreamsbuilt-image-policy"
  comment     = "Cache policy for image files"
  default_ttl = 604800   # 7 days
  max_ttl     = 31536000 # 1 year
  min_ttl     = 86400    # 1 day

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Origin request policy
resource "aws_cloudfront_origin_request_policy" "s3_policy" {
  name    = "${var.environment}-dreamsbuilt-s3-policy"
  comment = "Policy for S3 origin"

  cookies_config {
    cookie_behavior = "none"
  }

  headers_config {
    header_behavior = "none"
  }

  query_strings_config {
    query_string_behavior = "none"
  }
}

# Security headers policy
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.environment}-dreamsbuilt-security-headers"
  comment = "Security headers policy for DreamsBuilt"

  security_headers_config {
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }
}