import { env } from '@config/env';
import { logError, logInfo } from '@utils/logger';
import { Router, type Response } from 'express';
import { invalidateXeroCache } from 'libs/xero/cache';
import { createXeroClient, isXeroConfigured } from 'libs/xero/client';
import { consumeOauthState } from 'libs/xero/state';
import { saveTokenSet } from 'libs/xero/tokens';

const router = Router();

const settingsUrl = () => `${env.clientUrl}/dashboard/settings/xero`;

const redirectWithError = (res: Response, message: string) =>
  res.redirect(`${settingsUrl()}?error=${encodeURIComponent(message)}`);

router.get('/callback', async (req, res) => {
  try {
    if (!isXeroConfigured()) {
      return redirectWithError(res, 'Xero is not configured on the server.');
    }

    if (typeof req.query.error === 'string') {
      return redirectWithError(
        res,
        req.query.error === 'access_denied'
          ? 'Xero access was declined.'
          : `Xero returned an error: ${req.query.error}`
      );
    }

    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const stateData = state ? consumeOauthState(state) : null;

    if (!stateData) {
      return redirectWithError(
        res,
        'This connection attempt is invalid or has expired. Please try again.'
      );
    }

    const client = createXeroClient(state);
    await client.initialize();

    const tokenSet = await client.apiCallback(req.originalUrl);
    await client.updateTenants(false);

    const tenant = client.tenants[0];

    if (!tenant) {
      return redirectWithError(res, 'No Xero organisation was authorised.');
    }

    await saveTokenSet(
      tokenSet,
      { tenantId: tenant.tenantId, tenantName: tenant.tenantName ?? '' },
      stateData.userId
    );
    invalidateXeroCache();

    logInfo({
      message: 'Xero connected',
      details: { tenantName: tenant.tenantName, userId: stateData.userId }
    });

    return res.redirect(`${settingsUrl()}?connected=1`);
  } catch (error) {
    logError({ message: 'Xero OAuth callback failed', error });

    return redirectWithError(res, 'Connecting to Xero failed. Please try again.');
  }
});

export default router;
