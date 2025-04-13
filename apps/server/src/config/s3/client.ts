import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../env';

// Only create the S3 client if credentials are available
const createS3Client = (): S3Client | null => {
  if (!config.S3_ACCESS_KEY || !config.S3_SECRET_KEY || !config.S3_REGION) {
    console.warn('S3 credentials not provided. File storage features will be disabled.');
    return null;
  }

  return new S3Client({
    region: config.S3_REGION,
    credentials: {
      accessKeyId: config.S3_ACCESS_KEY,
      secretAccessKey: config.S3_SECRET_KEY
    }
  });
};

export const s3Client = createS3Client();
export const bucketName = config.S3_BUCKET_NAME;
