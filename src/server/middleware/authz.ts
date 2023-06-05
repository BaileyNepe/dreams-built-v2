export const getUserPermissions = (userScopeKey: string | string[]) => {
  if (typeof userScopeKey === 'string') {
    return new Set(userScopeKey.split(' '));
  }

  if (Array.isArray(userScopeKey)) {
    return new Set(userScopeKey);
  }
};
