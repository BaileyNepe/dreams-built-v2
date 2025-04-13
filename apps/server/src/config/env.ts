import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = {
  databaseUrl: process.env.DATABASE_URL,

  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,

  auth0IssuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  auth0Audience: process.env.AUTH0_AUDIENCE,
  cache: {},

  // S3 Configuration
  s3AccessKey: process.env.S3_ACCESS_KEY,
  s3SecretKey: process.env.S3_SECRET_KEY,
  s3Region: process.env.S3_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME
};

const isDevelopment = process.env.NODE_ENV === 'development';

const configValidation = z.object({
  databaseUrl: z.string(),
  expressPort: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive()
  ),
  auth0IssuerBaseURL: z.string(),
  auth0Audience: z.string(),
  environment: z.enum(['development', 'production', 'test', 'staging']),
  cache: z.object({
    type: z.enum(['local', 'redis']).default('local'),
    url: z.string().default('')
  }),

  // S3 Configuration - optional in development
  s3AccessKey: isDevelopment ? z.string().optional() : z.string(),
  s3SecretKey: isDevelopment ? z.string().optional() : z.string(),
  s3Region: isDevelopment ? z.string().optional() : z.string(),
  s3BucketName: isDevelopment ? z.string().optional() : z.string()
});

export const env = configValidation.parse(rawEnv);

// Export a config object for easier access
export const config = {
  DATABASE_URL: env.databaseUrl,
  PORT: env.expressPort,
  NODE_ENV: env.environment,
  AUTH0_ISSUER_BASE_URL: env.auth0IssuerBaseURL,
  AUTH0_AUDIENCE: env.auth0Audience,
  S3_ACCESS_KEY: env.s3AccessKey || '',
  S3_SECRET_KEY: env.s3SecretKey || '',
  S3_REGION: env.s3Region || '',
  S3_BUCKET_NAME: env.s3BucketName || ''
};
