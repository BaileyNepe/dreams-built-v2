
import { type User } from 'api/user/types';

export interface Cache {
  initialise: () => Promise<void>;
  
  user: {
    loadById: (id: string, dbCallback: () => Promise<User>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    clear: (organisationId: string) => Promise<void>;
    clearAll: () => Promise<void>;
  };

  clearAll: () => Promise<unknown>;
}
