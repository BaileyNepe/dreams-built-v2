import { randomBytes } from 'node:crypto';
import { LRUCache } from 'lru-cache';

// The OAuth callback arrives as a bare browser redirect with no Auth0 JWT, so
// this single-use state token is what binds the callback to the admin who
// initiated the connect flow.
const states = new LRUCache<string, { userId: string }>({
  max: 100,
  ttl: 10 * 60 * 1000
});

export const createOauthState = (userId: string) => {
  const state = randomBytes(24).toString('base64url');
  states.set(state, { userId });

  return state;
};

export const consumeOauthState = (state: string) => {
  const data = states.get(state);

  if (data) {
    states.delete(state);
  }

  return data ?? null;
};
