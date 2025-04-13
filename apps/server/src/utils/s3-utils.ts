import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@config/env';
import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { s3Client } from '../config/s3/client';

// Check if S3 is configured
const isS3Configured = () => {
  if (!s3Client) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'S3 storage is not configured. File operations are unavailable.'
    });
  }
  return true;
};

// Generate S3 key for storage
export const generateS3Key = (projectId: string, fileName: string): string => {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-_]/g, '_');
  const uuid = randomUUID();
  return `projects/${projectId}/${uuid}-${safeFileName}`;
};

// Get a presigned URL for direct browser uploads
export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600
) => {
  isS3Configured();

  const command = new PutObjectCommand({
    Bucket: env.s3BucketName,
    Key: key,
    ContentType: contentType
  });

  return getSignedUrl(s3Client!, command, { expiresIn });
};

// Get a presigned URL for downloading/viewing files
export const getPresignedDownloadUrl = async (key: string, expiresIn = 3600) => {
  isS3Configured();

  // If CloudFront is configured, use it for download URLs
  if (env.cloudFrontUrl) {
    return `${env.cloudFrontUrl}/${key}`;
  }
  const bucketName = env.s3BucketName;
  // Fall back to S3 presigned URL if no CloudFront is configured
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  return getSignedUrl(s3Client!, command, { expiresIn });
};

// Delete a file from S3
export const deleteS3Object = async (key: string) => {
  isS3Configured();

  const command = new DeleteObjectCommand({
    Bucket: env.s3BucketName,
    Key: key
  });

  return s3Client!.send(command);
};

// Compress image/PDF utilities could be added here
export const optimizeFile = (fileBuffer: Buffer, contentType: string): Promise<Buffer> =>
  // This is where you'd implement image compression, PDF optimization, etc.
  // For now, we'll just return the original buffer
  // Future implementation could use libraries like sharp for images
  Promise.resolve(fileBuffer);
