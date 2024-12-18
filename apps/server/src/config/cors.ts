import { type CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: async (origin, callback) => {
    // TODO: replace with actual allowed domains
    const allowedDomains = ['http://localhost:3000', 'https://example.com'];
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Important for cookies
};
