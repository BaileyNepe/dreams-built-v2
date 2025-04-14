import { env } from '@config/env';
import { type CorsOptions } from 'cors';

const allowedDomains =
  env.environment === 'production'
    ? [
        'https://dreamsbuilt.co.nz',
        'https://www.dreamsbuilt.co.nz',
        'https://dreams-built.netlify.app'
      ]
    : ['http://localhost:3000'];

export const corsConfig: CorsOptions = {
  origin: async (origin, callback) => {
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Important for cookies
};
