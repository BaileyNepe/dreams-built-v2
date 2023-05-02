import { env } from '@/env.mjs';
import { useUser as useAuth0 } from '@auth0/nextjs-auth0/client';

export const useUser = () => {
  const domain = env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const { user } = useAuth0();

  const userRoles = user?.[`${domain}/roles`] as string[] | undefined;

  const isAdmin = userRoles?.includes('Admin');
  const isEmployee = userRoles?.includes('Employee');

  const role = isAdmin ? 'admin' : isEmployee ? 'employee' : 'user';

  return { ...user, role };
};
