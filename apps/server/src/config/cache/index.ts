/* eslint-disable @typescript-eslint/naming-convention */
import { env } from '@config/env';
import { logError } from '@utils/logger';
import localCache from './local';

let _cache = localCache;
export const cache = () => _cache;
export const setCacheDefaultCache = () => {
  _cache = localCache;
};

export const initialiseCache = async () => {
  try {
    _cache = (await import(`./${env.cache.type}/index.ts`)).default;
    await _cache.initialise();
  } catch (err) {
    logError({ details: { error: err }, message: 'Error initialising cache' });
    _cache = localCache;
  }
};
