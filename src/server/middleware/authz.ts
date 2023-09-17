export const getUserPermissions = async (authId: string) => {
  // TODO make DB call to get permissions

  if (!authId) {
    return [];
  }
  return ['admin'];
};
