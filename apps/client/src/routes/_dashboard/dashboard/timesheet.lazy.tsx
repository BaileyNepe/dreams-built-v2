import { createLazyFileRoute } from '@tanstack/react-router';
import { TimesheetPage } from 'pages/TimesheetPage';

export const Route = createLazyFileRoute('/_dashboard/dashboard/timesheet')({
  component: TimesheetPage
});
