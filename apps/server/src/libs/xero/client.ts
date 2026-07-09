import { env } from '@config/env';
import { TRPCError } from '@trpc/server';
import { XeroClient } from 'xero-node';

export const isXeroConfigured = () =>
  Boolean(
    env.xeroClientId &&
      env.xeroClientSecret &&
      env.xeroRedirectUri &&
      env.xeroTokenEncryptionKey
  );

export const assertXeroConfigured = () => {
  if (!isXeroConfigured()) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'Xero is not configured. Set XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI and XERO_TOKEN_ENCRYPTION_KEY.'
    });
  }
};

// `state` is only needed for the consent-url/callback pair; API calls omit it.
export const createXeroClient = (state?: string) =>
  new XeroClient({
    clientId: env.xeroClientId,
    clientSecret: env.xeroClientSecret,
    redirectUris: [env.xeroRedirectUri],
    scopes: env.xeroScopes.split(' '),
    ...(state ? { state } : {})
  });
