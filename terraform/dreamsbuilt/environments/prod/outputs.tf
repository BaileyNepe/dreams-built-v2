output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = module.files_bucket.bucket_id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.files_bucket.bucket_arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution for file uploads"
  value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution for file uploads"
  value       = module.cloudfront.distribution_id
}