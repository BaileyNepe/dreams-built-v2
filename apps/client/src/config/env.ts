export const rawConfig = {
  serverUrl: import.meta.env.VITE_SERVER_URL as string,

  resourcesDomain: import.meta.env.VITE_RESOURCES_DOMAIN as string,
  environment: import.meta.env.VITE_ENVIRONMENT as string,
  stripePK: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,

  reCaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY as string
};

if (!rawConfig.serverUrl) {
  throw new Error('VITE_SERVER_URL is required');
}

if (!rawConfig.environment) {
  throw new Error('VITE_ENVIRONMENT is required');
}

export const env = rawConfig;
