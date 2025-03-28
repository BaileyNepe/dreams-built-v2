import { createLazyFileRoute } from '@tanstack/react-router';
import { Schedule } from 'features/Schedule';
import { ScheduleProvider } from 'features/Schedule/components/useSchedule';

const Page = () => (
  <ScheduleProvider>
    <Schedule />
  </ScheduleProvider>
);

export const Route = createLazyFileRoute('/_dashboard/dashboard/schedule')({
  component: Page
});
