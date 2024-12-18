import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = {
  databaseUrl: process.env.DATABASE_URL,

  expressPort: process.env.EXPRESS_PORT,
  environment: process.env.NODE_ENV,

  backendServerUrl: process.env.BACKEND_SERVER_URL
};

const configValidation = z.object({
  databaseUrl: z.string(),
  expressPort: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive()
  ),
  environment: z.enum(['development', 'production', 'test', 'staging']),

  backendServerUrl: z.string(),

  cache: z.object({
    type: z.enum(['local', 'redis']).default('local'),
    url: z.string().default('')
  })
});

export const env = configValidation.parse(rawEnv);
