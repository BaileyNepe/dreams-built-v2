import { env } from '@/env.mjs';
import { useAuth0 } from '@auth0/auth0-react';

export const useUser = () => {
  const domain = env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const { user } = useAuth0();

  const isAdmin = user?.[`${domain}/roles`].includes('Admin');
  const isEmployee = user?.[`${domain}/roles`].includes('Employee');

  const role = isAdmin ? 'admin' : isEmployee ? 'employee' : 'user';

  return { ...user, role };
};
