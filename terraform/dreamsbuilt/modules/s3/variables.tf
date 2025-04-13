variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "bucket_tags" {
  description = "Tags to apply to the bucket"
  type        = map(string)
  default = {
    Name = "DreamsBuilt Files"
  }
}

variable "allowed_origins" {
  description = "List of origins allowed for CORS"
  type        = list(string)
  default     = ["*"]
}