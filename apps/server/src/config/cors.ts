import { getAllowedDomains } from 'api/organisation/service';
import { type CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: async (origin, callback) => {
    const allowedDomains = await getAllowedDomains();
    if (!origin || allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Important for cookies
};
