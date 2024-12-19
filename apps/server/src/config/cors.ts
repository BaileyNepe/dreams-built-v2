import { type CorsOptions } from 'cors';
import { env } from './env';

export const corsConfig: CorsOptions = {
  origin: async (origin, callback) => {
    if (env.frontendDomain === origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Important for cookies
};
