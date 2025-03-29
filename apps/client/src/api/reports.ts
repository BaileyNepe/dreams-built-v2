import { api } from './trpc';

export const useReportData = (week: string) =>
  api.reports.getTimesheets.useSuspenseQuery({
    week
  })[0];
