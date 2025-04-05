import { cache } from '@config/cache';
import { getRolePermissions } from '@dreams-built/shared/src/auth/roles';
import { TRPCError } from '@trpc/server';
import { loadUser } from './model';

export const getUserByAuthId = async (authId: string) => {
  const user = await loadUser(authId);

  if (!user) {
    return undefined;
  }

  const userPermissions = getRolePermissions(user.role);

  return {
    ...user,
    permissions: userPermissions
  };
};

export type User = Awaited<ReturnType<typeof getUserByAuthId>>;

export const getOptionalUser = async (authId: string) =>
  await cache().user.loadById(authId, async () => getUserByAuthId(authId));

export const getUser = async (authId: string) => {
  const user = await getOptionalUser(authId);
  if (!user) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Could not find user'
    });
  }

  return user;
};
