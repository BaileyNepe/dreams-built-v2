import { env } from '@/env.mjs';
import { useUser as useAuth0, type UserProfile } from '@auth0/nextjs-auth0/client';

export const useUser = (): {
  user?: UserProfile;
  role: 'admin' | 'employee' | 'user';
  isAdmin: boolean;
  isEmployee: boolean;
  isLoading: boolean;
  error?: Error;
} => {
  const domain = env.NEXT_PUBLIC_CUSTOM_DOMAIN;
  const { user, isLoading, error } = useAuth0();

  const userRoles = user?.[`${domain}/roles`] as string[] | undefined;

  const isAdmin = userRoles?.includes('Admin') ?? false;
  const isEmployee = userRoles?.includes('Employee') ?? false;

  const role = isAdmin ? 'admin' : isEmployee ? 'employee' : 'user';

  return { user, role, isAdmin, isEmployee, isLoading, error };
};
