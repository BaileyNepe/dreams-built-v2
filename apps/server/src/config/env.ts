import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = {
  databaseUrl: process.env.DATABASE_URL,

  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,

  auth0IssuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  auth0Audience: process.env.AUTH0_AUDIENCE,
  frontendDomain: process.env.FRONTEND_DOMAIN,
  cache: {}
};

const configValidation = z.object({
  databaseUrl: z.string(),
  expressPort: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive()
  ),
  frontendDomain: z.string(),
  auth0IssuerBaseURL: z.string(),
  auth0Audience: z.string(),
  environment: z.enum(['development', 'production', 'test', 'staging']),
  cache: z.object({
    type: z.enum(['local', 'redis']).default('local'),
    url: z.string().default('')
  })
});

export const env = configValidation.parse(rawEnv);
