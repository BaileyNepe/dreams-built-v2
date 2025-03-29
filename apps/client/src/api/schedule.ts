import { notify } from 'libs/Notify';
import { api } from './trpc';

export const useProjectParts = () => api.schedule.projectParts.useSuspenseQuery()[0];

export const useScheduleQuery = (startRange: string, endRange: string) =>
  api.schedule.get.useQuery({ startRange, endRange }).data;

export const useBlockMutation = () => {
  const apiUtils = api.useUtils();
  return api.schedule.blockDay.useMutation({
    onSuccess: () => {
      apiUtils.schedule.get.invalidate();
    }
  });
};

export const useCreateScheduleMutation = () => {
  const apiUtils = api.useUtils();
  return api.schedule.add.useMutation({
    onSuccess: () => {
      apiUtils.schedule.get.invalidate();
    }
  });
};

export const useUpdateScheduleMutation = () => {
  const apiUtils = api.useUtils();
  return api.schedule.update.useMutation({
    onSuccess: () => {
      apiUtils.schedule.get.invalidate();
    },
    onError: (e) => notify(`${e.message}`, { type: 'error' })
  });
};
