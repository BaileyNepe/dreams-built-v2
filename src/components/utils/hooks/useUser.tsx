import { env } from '@/env.mjs';
import { UserProfile, useUser as useAuth0 } from '@auth0/nextjs-auth0/client';

export const useUser = (): {
  user?: UserProfile;
  role: 'admin' | 'employee' | 'user';
} => {
  const domain = env.NEXT_PUBLIC_CUSTOM_DOMAIN;
  const { user } = useAuth0();

  const userRoles = user?.[`${domain}/roles`] as string[] | undefined;

  const isAdmin = userRoles?.includes('Admin');
  const isEmployee = userRoles?.includes('Employee');

  const role = isAdmin ? 'admin' : isEmployee ? 'employee' : 'user';

  return { user, role };
};
