variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "dreamsbuilt-files-dev"
}