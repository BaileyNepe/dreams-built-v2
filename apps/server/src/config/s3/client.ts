import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@config/env';

const createS3Client = (): S3Client | null =>
  new S3Client({
    region: env.s3Region,
    credentials: {
      accessKeyId: env.s3AccessKey,
      secretAccessKey: env.s3SecretKey
    }
  });

export const s3Client = createS3Client();
