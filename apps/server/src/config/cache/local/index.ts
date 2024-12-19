import { type User } from 'api/user/service';
import { type Cache } from '../types';

let userCache: Map<string, User> = new Map();

const localCache: Cache = {
  initialise: async () => {},

  user: {
    loadById: async (id, dbCallback) => {
      const user = userCache.get(id);

      if (user) {
        return user;
      }

      const newUser = await dbCallback();

      if (newUser) {
        userCache.set(id, newUser);
      }

      return newUser;
    },
    delete: async (id) => {
      userCache.delete(id);
    },
    clearAll: async () => {
      userCache = new Map();
    }
  },

  clearAll: async () => {
    userCache = new Map();
  }
};

export default localCache;
