import { prisma } from '@config/db';
import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { logWarning } from '@utils/logger';
import { invalidateXeroCache } from 'libs/xero/cache';
import { assertXeroConfigured, createXeroClient, isXeroConfigured } from 'libs/xero/client';
import { decrypt } from 'libs/xero/crypto';
import { createOauthState } from 'libs/xero/state';
import { clearConnection, getConnection } from 'libs/xero/tokens';
import { z } from 'zod';

// Rotating refresh tokens expire after 60 days of inactivity; the row's
// updatedAt tracks the last rotation, so warn well before the cliff.
const EXPIRY_WARNING_MS = 50 * 24 * 60 * 60 * 1000;

export const connectionRouter = trpc.router({
  status: protectedProcedure([authz.payroll_view_self, authz.jobs_read], {
    requireAllPermissions: false
  }).query(async () => {
    const connection = await getConnection();

    if (!connection) {
      return {
        configured: isXeroConfigured(),
        status: 'DISCONNECTED' as const,
        tenantName: '',
        connectedAt: null as Date | null,
        expiresSoon: false,
        scopes: [] as string[]
      };
    }

    return {
      configured: isXeroConfigured(),
      status: connection.status,
      tenantName: connection.tenantName,
      connectedAt: connection.createdAt,
      expiresSoon:
        connection.status === 'CONNECTED' &&
        Date.now() - connection.updatedAt.getTime() > EXPIRY_WARNING_MS,
      scopes: connection.scopes ? connection.scopes.split(' ') : []
    };
  }),

  getConnectUrl: protectedProcedure([authz.xero_manage]).mutation(async ({ ctx }) => {
    assertXeroConfigured();

    const state = createOauthState(ctx.user.id);
    const client = createXeroClient(state);
    await client.initialize();

    return { url: await client.buildConsentUrl() };
  }),

  disconnect: protectedProcedure([authz.xero_manage]).mutation(async () => {
    const connection = await getConnection();

    if (connection?.refreshToken) {
      try {
        const client = createXeroClient();
        client.setTokenSet({
          access_token: decrypt(connection.accessToken),
          refresh_token: decrypt(connection.refreshToken),
          token_type: 'Bearer'
        });
        await client.revokeToken();
      } catch (error) {
        // Revocation is best-effort; the local connection is cleared regardless.
        logWarning({ message: 'Xero token revocation failed', error });
      }
    }

    await clearConnection();

    return true;
  }),

  setDefaultEarningsRate: protectedProcedure([authz.xero_manage])
    .input(z.object({ earningsRateId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.xeroConnection.updateMany({
        where: { id: 'singleton' },
        data: { defaultEarningsRateId: input.earningsRateId }
      });
      invalidateXeroCache();

      return true;
    })
});
