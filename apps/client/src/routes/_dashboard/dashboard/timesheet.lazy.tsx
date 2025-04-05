import { createLazyFileRoute } from '@tanstack/react-router';
import { Timesheet } from 'features/Timesheet';
import { TimesheetProvider } from 'features/Timesheet/hooks/useTimesheet';
import { type FC } from 'react';

export const TimesheetPage: FC = () => (
  <TimesheetProvider>
    <Timesheet />
  </TimesheetProvider>
);

export const Route = createLazyFileRoute('/_dashboard/dashboard/timesheet')({
  component: TimesheetPage
});
