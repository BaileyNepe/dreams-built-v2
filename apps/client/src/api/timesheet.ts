import { notify } from 'libs/Notify';
import { api } from './trpc';

export const useTimesheetEntries = ({
  weekStart,
  userId
}: {
  weekStart: string;
  userId: string;
}) =>
  api.timesheet.get.useQuery(
    {
      weekStart,
      userId
    },
    {
      throwOnError: true
    }
  );

export const useTimesheetMutation = ({
  userId,
  weekStart
}: {
  userId: string;
  weekStart: string;
}) => {
  const utils = api.useUtils();

  return api.timesheet.update.useMutation({
    onSuccess: () => {
      notify('Timesheet updated', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.reports.invalidate();
      utils.timesheet.get.invalidate({
        weekStart,
        userId
      });
    }
  });
};

export const useUpdateTimesheetEntryMutation = () => {
  const utils = api.useUtils();

  return api.timesheet.updateById.useMutation({
    onSuccess: () => {
      notify('Timesheet entry updated', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.reports.invalidate();
      utils.timesheet.get.invalidate();
    }
  });
};
