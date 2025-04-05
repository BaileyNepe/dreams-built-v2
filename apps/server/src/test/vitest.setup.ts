/* eslint-disable import/no-extraneous-dependencies */
import { cache } from '@config/cache';
import * as console from '@utils/logger';
import { resetSeed, seed } from 'seedar';
import { afterAll, beforeAll } from 'vitest';

beforeAll(async () => {
  vi.spyOn(console, 'logInfo').mockReturnValue();
  vi.spyOn(console, 'logError').mockReturnValue();
  vi.spyOn(console, 'logWarning').mockReturnValue();
  await cache().clearAll();
  await resetSeed();
  await seed();
});

afterAll(async () => {
  await resetSeed();
});
