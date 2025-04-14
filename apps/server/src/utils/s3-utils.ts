import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
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
export const getPresignedDownloadUrl = (key: string) => `${env.cloudFrontUrl}/${key}`;

// Get file from S3
export const getS3Object = async (key: string): Promise<Buffer> => {
  isS3Configured();

  const command = new GetObjectCommand({
    Bucket: env.s3BucketName,
    Key: key
  });

  const response = await s3Client!.send(command);
  const chunks: Uint8Array[] = [];

  if (!response.Body) {
    throw new Error('File data is empty');
  }

  // @ts-expect-error - ReadableStream type is not recognized correctly
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

// Upload optimized file to S3 (replace the existing one or create a new one with a different key)
export const uploadOptimizedFile = async (
  key: string,
  data: Buffer,
  contentType: string
): Promise<void> => {
  isS3Configured();

  const command = new PutObjectCommand({
    Bucket: env.s3BucketName,
    Key: key,
    Body: data,
    ContentType: contentType
  });

  await s3Client!.send(command);
};

// Generate a key for optimized version
export const generateOptimizedKey = (
  originalKey: string,
  optimization: string
): string => {
  const keyParts = originalKey.split('.');
  const extension = keyParts.pop();

  // If it's an image being converted to webp, change the extension
  if (optimization === 'webp') {
    return `${keyParts.join('.')}.webp`;
  }

  // For PDF optimization, keep the same extension
  return `${keyParts.join('.')}_optimized.${extension}`;
};
