import { authz } from '@dreams-built/shared/src/auth/permissions';
import { useAuth } from 'utils/contexts/AuthProvider';
import { api } from './trpc';

export const useContactMutation = () => api.contact.contact.useMutation();

export const useMessagesList = ({
  page,
  perPage,
  query
}: {
  page: number;
  perPage: number;
  query?: string;
}) => api.contact.list.useQuery({ page, perPage, query });

export const useUnreadMessagesCount = (options?: { refetchInterval?: number }) => {
  const { user } = useAuth();
  return api.contact.countUnread.useQuery(undefined, {
    refetchInterval: options?.refetchInterval ?? 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    enabled: !!user?.permissions?.includes(authz.messages_read)
  });
};

export const useMarkMessageAsRead = () => {
  const utils = api.useUtils();

  return api.contact.markAsRead.useMutation({
    onSuccess: () => {
      utils.contact.countUnread.invalidate();
    }
  });
};

export const useMarkAllMessagesAsRead = () => {
  const utils = api.useUtils();

  return api.contact.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate();
      utils.contact.countUnread.invalidate();
    }
  });
};
