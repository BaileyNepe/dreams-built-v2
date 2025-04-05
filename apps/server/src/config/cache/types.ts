import { type User } from 'api/user/service';

export interface Cache {
  initialise: () => Promise<void>;

  user: {
    loadById: (
      id: string,
      dbCallback: () => Promise<User | undefined>
    ) => Promise<User | undefined>;
    delete: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
  };

  clearAll: () => Promise<unknown>;
}
