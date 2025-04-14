import { authz } from '@dreams-built/shared/src/auth/permissions';
import { keepPreviousData } from '@tanstack/react-query';
import { notify } from 'libs/Notify';
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
      enabled,
      placeholderData: keepPreviousData
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
      return data.filter((u) => u.role === 'EMPLOYEE');
    }
  });
};

export const useUser = (id: string) => api.users.get.useSuspenseQuery(id)[0];

export const useUpdateUserMutation = (id: string) => {
  const apiUtils = api.useUtils();

  return api.users.update.useMutation({
    onSuccess: () => {
      notify('User updated successfully', { type: 'success' });
    },
    onSettled: () => {
      apiUtils.users.get.invalidate(id);
      apiUtils.users.list.invalidate();
    }
  });
};
