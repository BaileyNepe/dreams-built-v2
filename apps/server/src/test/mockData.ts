/* -------------------------------------------------------------------------- */
/*                                MOCK CREATORS                               */
/* -------------------------------------------------------------------------- */

export const mockedClient = 'http://localhost:3333';
export const defaultUserId = 'cm36xkhjh00254amrrq30148o';

/* -------------------------------------------------------------------------- */
/*                                  CLEAN UP                                  */
/* -------------------------------------------------------------------------- */

export const cleanup = {
  // Required to remove in this order due to foreign key constraints
  contactForm: async () => {}
};

export const cleanUpAllData = async () => {
  const cleanupFunctions = Object.values(cleanup);

  for (const cleanupFunction of cleanupFunctions) {
    await cleanupFunction();
  }
};
