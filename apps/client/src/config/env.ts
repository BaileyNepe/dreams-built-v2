import { z } from 'zod';

export const rawConfig = {
  serverUrl: import.meta.env.VITE_SERVER_URL,
  environment: import.meta.env.VITE_ENVIRONMENT,

  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN,
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID
};

const parser = z.object({
  serverUrl: z.string(),
  environment: z.string(),

  auth0Domain: z.string(),
  auth0ClientId: z.string()
});

export const env = parser.parse(rawConfig);
