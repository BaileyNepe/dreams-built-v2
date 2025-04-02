import { createLazyFileRoute } from '@tanstack/react-router';
import { Report } from 'features/Reports';

export const Route = createLazyFileRoute('/_dashboard/dashboard/reports')({
  component: Report
});
