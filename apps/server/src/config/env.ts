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
  s3BucketName: process.env.S3_BUCKET_NAME,
  cloudFrontUrl: process.env.CLOUDFRONT_URL,

  // Xero Configuration
  clientUrl: process.env.CLIENT_URL,
  xeroClientId: process.env.XERO_CLIENT_ID,
  xeroClientSecret: process.env.XERO_CLIENT_SECRET,
  xeroRedirectUri: process.env.XERO_REDIRECT_URI,
  xeroScopes: process.env.XERO_SCOPES,
  xeroTokenEncryptionKey: process.env.XERO_TOKEN_ENCRYPTION_KEY
};

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

  s3AccessKey: z.string(),
  s3SecretKey: z.string(),
  s3Region: z.string(),
  s3BucketName: z.string(),
  cloudFrontUrl: z.string(),

  // Optional so the server boots without a Xero app configured;
  // the Xero routers reject with a clear error when unset.
  clientUrl: z.string().default('http://localhost:3000'),
  xeroClientId: z.string().default(''),
  xeroClientSecret: z.string().default(''),
  xeroRedirectUri: z.string().default(''),
  xeroScopes: z
    .string()
    .default(
      'openid profile email offline_access projects accounting.contacts payroll.employees.read payroll.settings.read payroll.payruns.read payroll.payslips.read payroll.timesheets'
    ),
  xeroTokenEncryptionKey: z.string().default('')
});

export const env = configValidation.parse(rawEnv);
