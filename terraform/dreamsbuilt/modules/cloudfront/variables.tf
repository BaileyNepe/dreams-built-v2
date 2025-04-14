variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "distribution_name" {
  description = "Name of the CloudFront distribution"
  type        = string
  default     = "DreamsBuilt Files CDN"
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100" # Use lowest cost option (NA and EU only)
}

variable "domain_aliases" {
  description = "List of domain aliases for the CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "use_default_certificate" {
  description = "Whether to use the default CloudFront certificate or a custom one"
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate to use for the CloudFront distribution"
  type        = string
  default     = null
}