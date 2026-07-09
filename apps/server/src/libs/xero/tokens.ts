import { prisma } from '@config/db';
import { env } from '@config/env';
import { TRPCError } from '@trpc/server';
import { logError, logInfo } from '@utils/logger';
import { type TokenSet, type XeroClient } from 'xero-node';
import { invalidateXeroCache } from './cache';
import { assertXeroConfigured, createXeroClient } from './client';
import { decrypt, encrypt } from './crypto';
import { mapXeroError } from './errors';

const SINGLETON_ID = 'singleton';
// Refresh when the access token has less than a minute left.
const REFRESH_BUFFER_MS = 60 * 1000;

export const getConnection = async () =>
  prisma.xeroConnection.findUnique({ where: { id: SINGLETON_ID } });

export const saveTokenSet = async (
  tokenSet: TokenSet,
  tenant?: { tenantId: string; tenantName: string },
  connectedById?: string
) => {
  if (!tokenSet.access_token || !tokenSet.refresh_token) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Xero returned an incomplete token set'
    });
  }

  const tokenData = {
    accessToken: encrypt(tokenSet.access_token),
    refreshToken: encrypt(tokenSet.refresh_token),
    accessTokenExpiresAt: tokenSet.expires_at
      ? new Date(tokenSet.expires_at * 1000)
      : new Date(Date.now() + 25 * 60 * 1000),
    scopes: tokenSet.scope ?? '',
    status: 'CONNECTED' as const,
    ...(tenant ?? {}),
    ...(connectedById ? { connectedById } : {})
  };

  return prisma.xeroConnection.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...tokenData },
    update: tokenData
  });
};

export const markConnectionError = async () =>
  prisma.xeroConnection.updateMany({
    where: { id: SINGLETON_ID },
    data: { status: 'ERROR' }
  });

export const clearConnection = async () => {
  await prisma.xeroConnection.updateMany({
    where: { id: SINGLETON_ID },
    data: {
      status: 'DISCONNECTED',
      accessToken: '',
      refreshToken: '',
      accessTokenExpiresAt: null,
      tenantId: '',
      tenantName: '',
      scopes: ''
    }
  });
  invalidateXeroCache();
};

const notConnectedError = () =>
  new TRPCError({
    code: 'PRECONDITION_FAILED',
    message: 'Xero is not connected. An admin can connect it in Settings → Xero.'
  });

const reconnectError = () =>
  new TRPCError({
    code: 'PRECONDITION_FAILED',
    message: 'The Xero connection has expired. An admin must reconnect it in Settings → Xero.'
  });

// Xero refresh tokens are single-use: two concurrent refreshes with the same
// token invalidate the connection. All callers share one in-flight refresh,
// and the rotated token set is persisted before the promise resolves.
// NOTE: this guards a single process only — if the server ever runs more than
// one instance, replace with a Postgres advisory lock.
let refreshInFlight: Promise<void> | null = null;

const refreshTokens = async (encryptedRefreshToken: string) => {
  try {
    const client = createXeroClient();
    const tokenSet = await client.refreshWithRefreshToken(
      env.xeroClientId,
      env.xeroClientSecret,
      decrypt(encryptedRefreshToken)
    );

    await saveTokenSet(tokenSet);
    logInfo({ message: 'Xero access token refreshed' });
  } catch (error) {
    logError({ message: 'Xero token refresh failed', error });
    await markConnectionError();
    throw reconnectError();
  }
};

const ensureFreshConnection = async () => {
  let connection = await getConnection();

  if (!connection || connection.status === 'DISCONNECTED' || !connection.refreshToken) {
    throw notConnectedError();
  }

  if (connection.status === 'ERROR') {
    throw reconnectError();
  }

  const expiresAt = connection.accessTokenExpiresAt?.getTime() ?? 0;

  if (expiresAt - Date.now() <= REFRESH_BUFFER_MS) {
    if (!refreshInFlight) {
      refreshInFlight = refreshTokens(connection.refreshToken).finally(() => {
        refreshInFlight = null;
      });
    }

    await refreshInFlight;

    connection = await getConnection();

    if (!connection || connection.status !== 'CONNECTED') {
      throw reconnectError();
    }
  }

  return connection;
};

export const withXero = async <T>(
  fn: (xero: XeroClient, tenantId: string) => Promise<T>
): Promise<T> => {
  assertXeroConfigured();

  const connection = await ensureFreshConnection();

  const client = createXeroClient();
  client.setTokenSet({
    access_token: decrypt(connection.accessToken),
    refresh_token: decrypt(connection.refreshToken),
    expires_at: Math.floor(
      (connection.accessTokenExpiresAt?.getTime() ?? Date.now()) / 1000
    ),
    token_type: 'Bearer',
    scope: connection.scopes
  });

  try {
    return await fn(client, connection.tenantId);
  } catch (error) {
    throw mapXeroError(error);
  }
};
