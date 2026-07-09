/**
 * Unit tests for the Xero integration (TEST_TYPE=unit — no DB, no Xero).
 * Covers the token-refresh mutex (single-use rotating refresh tokens),
 * error mapping, token encryption, the timesheet minutes→hours aggregation,
 * and payroll-calendar alignment blockers.
 */

import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { decrypt, encrypt } from 'libs/xero/crypto';
import { mapXeroError } from 'libs/xero/errors';
import { withXero } from 'libs/xero/tokens';
import { buildXeroProjectName } from './projects/service';
import {
  addDays,
  diffInDays,
  getCalendarBlocker,
  getWeekUserHours,
  roundHours
} from './timesheets/service';

const { mockDb, mockXeroClient } = vi.hoisted(() => ({
  mockDb: {
    xeroConnection: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn()
    },
    timeEntry: {
      findMany: vi.fn()
    }
  },
  mockXeroClient: {
    setTokenSet: vi.fn(),
    refreshWithRefreshToken: vi.fn(),
    initialize: vi.fn(),
    buildConsentUrl: vi.fn()
  }
}));

vi.mock('@config/env', () => ({
  env: {
    environment: 'test',
    clientUrl: 'http://localhost:3000',
    xeroClientId: 'client-id',
    xeroClientSecret: 'client-secret',
    xeroRedirectUri: 'http://localhost:5001/api/v1/xero/callback',
    xeroScopes: 'openid profile email offline_access projects',
    xeroTokenEncryptionKey: 'a'.repeat(64)
  }
}));

vi.mock('@config/db', () => ({ prisma: mockDb }));

vi.mock('xero-node', () => ({
  XeroClient: vi.fn(() => mockXeroClient)
}));

describe('crypto', () => {
  it('round-trips a value', () => {
    const blob = encrypt('secret-token');

    expect(blob).not.toContain('secret-token');
    expect(blob.split(':')).toHaveLength(3);
    expect(decrypt(blob)).toBe('secret-token');
  });

  it('produces a different ciphertext per call (random IV)', () => {
    expect(encrypt('x')).not.toBe(encrypt('x'));
  });
});

describe('mapXeroError', () => {
  it('passes TRPCErrors through', () => {
    const error = new TRPCError({ code: 'NOT_FOUND', message: 'x' });

    expect(mapXeroError(error)).toBe(error);
  });

  it('maps 401/403 to PRECONDITION_FAILED', () => {
    expect(mapXeroError({ response: { statusCode: 401 } }).code).toBe(
      'PRECONDITION_FAILED'
    );
    expect(mapXeroError({ response: { statusCode: 403 } }).code).toBe(
      'PRECONDITION_FAILED'
    );
  });

  it('maps 429 to TOO_MANY_REQUESTS and surfaces retry-after', () => {
    const mapped = mapXeroError({
      response: { statusCode: 429, headers: { 'retry-after': '42' } }
    });

    expect(mapped.code).toBe('TOO_MANY_REQUESTS');
    expect(mapped.message).toContain('42');
  });

  it('maps 400 to BAD_REQUEST with Xero validation detail', () => {
    const mapped = mapXeroError({
      response: {
        statusCode: 400,
        body: {
          Elements: [{ ValidationErrors: [{ Message: 'Name is required' }] }]
        }
      }
    });

    expect(mapped.code).toBe('BAD_REQUEST');
    expect(mapped.message).toContain('Name is required');
  });

  it('maps unknown errors to INTERNAL_SERVER_ERROR', () => {
    expect(mapXeroError(new Error('boom')).code).toBe('INTERNAL_SERVER_ERROR');
  });
});

describe('withXero token refresh', () => {
  const connectedRow = (expiresInMs: number) => ({
    id: 'singleton',
    tenantId: 'tenant-1',
    tenantName: 'Demo Company (NZ)',
    accessToken: encrypt('access-token'),
    refreshToken: encrypt('refresh-token'),
    accessTokenExpiresAt: new Date(Date.now() + expiresInMs),
    scopes: 'openid',
    status: 'CONNECTED',
    defaultEarningsRateId: '',
    connectedById: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws PRECONDITION_FAILED when not connected', async () => {
    mockDb.xeroConnection.findUnique.mockResolvedValue(null);

    await expect(withXero(async () => 'unused')).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED'
    });
  });

  it('calls through with the tenant id when the token is fresh', async () => {
    mockDb.xeroConnection.findUnique.mockResolvedValue(connectedRow(20 * 60 * 1000));

    const result = await withXero(async (_xero, tenantId) => tenantId);

    expect(result).toBe('tenant-1');
    expect(mockXeroClient.refreshWithRefreshToken).not.toHaveBeenCalled();
    expect(mockXeroClient.setTokenSet).toHaveBeenCalledWith(
      expect.objectContaining({ access_token: 'access-token' })
    );
  });

  it('refreshes once for concurrent callers when the token is expired', async () => {
    const expired = connectedRow(-1000);
    const fresh = connectedRow(30 * 60 * 1000);
    let refreshed = false;

    mockDb.xeroConnection.findUnique.mockImplementation(async () =>
      refreshed ? fresh : expired
    );
    mockDb.xeroConnection.upsert.mockImplementation(async () => {
      refreshed = true;
      return fresh;
    });

    let resolveRefresh: (value: unknown) => void = () => {};
    mockXeroClient.refreshWithRefreshToken.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    const first = withXero(async (_xero, tenantId) => tenantId);
    const second = withXero(async (_xero, tenantId) => tenantId);

    // Let both callers reach the refresh gate before it resolves.
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
    resolveRefresh({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      scope: 'openid'
    });

    await expect(first).resolves.toBe('tenant-1');
    await expect(second).resolves.toBe('tenant-1');
    expect(mockXeroClient.refreshWithRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('marks the connection as errored when the refresh fails', async () => {
    mockDb.xeroConnection.findUnique.mockResolvedValue(connectedRow(-1000));
    mockDb.xeroConnection.updateMany.mockResolvedValue({ count: 1 });
    mockXeroClient.refreshWithRefreshToken.mockRejectedValue(
      new Error('invalid_grant')
    );

    await expect(withXero(async () => 'unused')).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED'
    });
    expect(mockDb.xeroConnection.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'ERROR' } })
    );
  });

  it('rejects with a reconnect error when the connection is in ERROR state', async () => {
    mockDb.xeroConnection.findUnique.mockResolvedValue({
      ...connectedRow(30 * 60 * 1000),
      status: 'ERROR'
    });

    await expect(withXero(async () => 'unused')).rejects.toMatchObject({
      code: 'PRECONDITION_FAILED'
    });
    expect(mockXeroClient.refreshWithRefreshToken).not.toHaveBeenCalled();
  });
});

describe('timesheet date helpers', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-06-29', 6)).toBe('2026-07-05');
    expect(addDays('2026-07-06', 0)).toBe('2026-07-06');
  });

  it('computes day differences', () => {
    expect(diffInDays('2026-07-06', '2026-06-29')).toBe(7);
    expect(diffInDays('2026-07-06', '2026-07-06')).toBe(0);
  });

  it('rounds minutes to 2dp hours', () => {
    expect(roundHours(480)).toBe(8);
    expect(roundHours(50)).toBe(0.83);
  });
});

describe('getWeekUserHours', () => {
  it('aggregates minutes per user per day into hours', async () => {
    mockDb.timeEntry.findMany.mockResolvedValue([
      {
        day: 'Monday',
        duration: 240,
        user: { id: 'u1', firstName: 'Amy', lastName: 'A', xeroEmployeeId: 'xe-1' }
      },
      {
        day: 'Monday',
        duration: 240,
        user: { id: 'u1', firstName: 'Amy', lastName: 'A', xeroEmployeeId: 'xe-1' }
      },
      {
        day: 'Tuesday',
        duration: 90,
        user: { id: 'u1', firstName: 'Amy', lastName: 'A', xeroEmployeeId: 'xe-1' }
      },
      {
        day: 'Friday',
        duration: 480,
        user: { id: 'u2', firstName: 'Ben', lastName: 'B', xeroEmployeeId: null }
      }
    ]);

    const rows = await getWeekUserHours('2026-07-06');

    expect(rows).toHaveLength(2);

    const amy = rows.find((row) => row.userId === 'u1');
    expect(amy?.hoursByDay).toEqual({ Monday: 8, Tuesday: 1.5 });
    expect(amy?.totalHours).toBe(9.5);
    expect(amy?.xeroEmployeeId).toBe('xe-1');

    const ben = rows.find((row) => row.userId === 'u2');
    expect(ben?.hoursByDay).toEqual({ Friday: 8 });
    expect(ben?.xeroEmployeeId).toBeNull();
  });

  it('drops users with zero total hours', async () => {
    mockDb.timeEntry.findMany.mockResolvedValue([
      {
        day: 'Monday',
        duration: 0,
        user: { id: 'u1', firstName: 'Amy', lastName: 'A', xeroEmployeeId: null }
      }
    ]);

    await expect(getWeekUserHours('2026-07-06')).resolves.toEqual([]);
  });
});

describe('getCalendarBlocker', () => {
  const weekly = {
    payrollCalendarId: 'cal-1',
    name: 'Weekly',
    isWeekly: true,
    periodStartDate: '2026-06-29T00:00:00'
  };

  it('blocks when the employee has no calendar', () => {
    expect(getCalendarBlocker(undefined, '2026-07-06')).toContain('no payroll calendar');
  });

  it('blocks non-weekly calendars', () => {
    expect(
      getCalendarBlocker({ ...weekly, isWeekly: false, name: 'Monthly' }, '2026-07-06')
    ).toContain('not weekly');
  });

  it('allows weekly calendars whose cycle aligns with the app week', () => {
    expect(getCalendarBlocker(weekly, '2026-07-06')).toBeNull();
    expect(getCalendarBlocker(weekly, '2026-06-29')).toBeNull();
  });

  it('blocks weekly calendars offset from the app week', () => {
    // Calendar runs Wednesday–Tuesday; the app week starts Monday.
    expect(
      getCalendarBlocker({ ...weekly, periodStartDate: '2026-07-01T00:00:00' }, '2026-07-06')
    ).toContain('does not align');
  });
});

describe('buildXeroProjectName', () => {
  it('formats jobNumber, address and city', () => {
    expect(
      buildXeroProjectName({ jobNumber: 1042, address: '12 High St', city: 'Cambridge' })
    ).toBe('1042 - 12 High St, Cambridge');
  });

  it('omits a blank city', () => {
    expect(buildXeroProjectName({ jobNumber: 7, address: '1 Low Rd', city: '' })).toBe(
      '7 - 1 Low Rd'
    );
  });
});
