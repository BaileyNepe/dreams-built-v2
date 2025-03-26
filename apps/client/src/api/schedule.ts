import { api } from './trpc';

export const useProjectParts = () => api.schedule.projectParts.useSuspenseQuery()[0];

export const useScheduleQuery = (startRange: string, endRange: string) =>
  api.schedule.get.useSuspenseQuery({ startRange, endRange })[0];
