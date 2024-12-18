import { env } from '@config/env';
import { logError, logInfo } from '@utils/logger';
import {
  cleanUpAllData,
} from 'test/mockData';

export const seed = async () => {
  try {
    logInfo({ message: 'Starting data seeding...' });

    if (!env.databaseUrl.includes('test')) {
      throw new Error('Database url does not include the word "test"');
    }

    

    
    logInfo({ message: 'Data seeded successfully' });
  } catch (e) {
    logError({ message: 'Data seeding failed', error: e });
    process.exit(1); // Exit with failure code
  }
};

export const resetSeed = async () => {
  try {
    logInfo({ message: 'Starting data reset...' });
    if (!env.databaseUrl.includes('test')) {
      throw new Error('Database url does not include the word "test"');
    }

    await cleanUpAllData();

    logInfo({ message: 'Data reset successfully' });
  } catch (e) {
    logError({ message: 'Data reset failed', error: e });
    process.exit(1); // Exit with failure code
  }
};
