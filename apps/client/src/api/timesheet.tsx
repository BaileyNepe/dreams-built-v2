import { useAuth } from 'utils/contexts/AuthProvider';
import { api } from './trpc';

export const useTimeSheetEntries = ({
  weekStart,
  userId
}: {
  weekStart: string;
  userId?: string;
}) => {
  const { user } = useAuth();

  return api.timesheet.get.useQuery({
    weekStart,
    userId: userId ?? user.id
  });
};
