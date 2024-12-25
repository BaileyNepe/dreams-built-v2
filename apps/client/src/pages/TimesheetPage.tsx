import { Timesheet } from 'features/Timesheet';
import { TimesheetProvider } from 'features/Timesheet/hooks/useTimesheet';
import { type FC } from 'react';

export const TimesheetPage: FC = () => (
  <TimesheetProvider>
    <Timesheet />
  </TimesheetProvider>
);
