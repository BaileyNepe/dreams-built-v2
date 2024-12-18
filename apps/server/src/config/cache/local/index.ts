import { type Organisations } from 'api/organisation/types';
import { type User } from 'api/user/types';
import { LRUCache } from 'lru-cache';
import { type Cache } from '../types';

let userCache: Map<string, User> = new Map();
let organisationCache: Organisations = [];

const rateLimiterCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24
});

const localCache: Cache = {
  initialise: async () => {},
  rateLimiter: {
    get: async (key) => rateLimiterCache.get(key),
    set: async ({ key, value, ttl }) => {
      rateLimiterCache.set(key, value, { ttl: ttl * 1000 });
    },
    delete: async (key) => {
      rateLimiterCache.delete(key);
    },
    increment: async (key) => {
      const current = rateLimiterCache.get(key) || 0;
      rateLimiterCache.set(key, current + 1);
    }
  },
  user: {
    loadById: async (id, dbCallback) => {
      const user = userCache.get(id);

      if (user) {
        return user;
      }

      const newUser = await dbCallback();

      userCache.set(id, newUser);

      return newUser;
    },
    delete: async (id) => {
      userCache.delete(id);
    },
    clear: async (organisationId: string) => {
      for (const [key] of userCache.entries()) {
        if (key.includes(organisationId)) {
          userCache.delete(key);
        }
      }
    },
    clearAll: async () => {
      userCache = new Map();
    }
  },
  organisations: {
    load: async (dbCallback) => {
      if (organisationCache.length) {
        return organisationCache;
      }

      organisationCache = await dbCallback();

      return organisationCache;
    },
    clear: async () => {
      organisationCache = [];
    }
  },

  clearAll: async () => {}
};

export default localCache;
