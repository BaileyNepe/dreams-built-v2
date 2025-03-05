import { authz } from '@dreams-built/shared/src/auth/permissions';
import { useAuth } from 'utils/contexts/AuthProvider';
import { api } from './trpc';

export const useProfileQuery = ({
  enabled,
  firstName,
  lastName,
  email,
  image
}: {
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
}) =>
  api.users.profile.useQuery(
    {
      firstName,
      lastName,
      email,
      image
    },
    {
      enabled
    }
  );

export const useUsers = (
  {
    showAll
  }: {
    showAll?: boolean;
  } = {
    showAll: false
  }
) => {
  const { user } = useAuth();
  return api.users.list.useQuery(undefined, {
    enabled: user.permissions?.includes(authz.timesheet_view_all),
    select: (data) => {
      if (showAll) {
        return data;
      }
      return data.filter((u) => u.role !== 'USER');
    }
  });
};
