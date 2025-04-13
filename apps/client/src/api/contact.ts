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
}) =>
  api.contact.list.useQuery(
    { page, perPage, query },
    {
      keepPreviousData: true
    }
  );

export const useUnreadMessagesCount = (options?: { refetchInterval?: number }) =>
  api.contact.countUnread.useQuery(undefined, {
    refetchInterval: options?.refetchInterval ?? 30000, // Default to 30 seconds
    refetchOnWindowFocus: true
  });

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
