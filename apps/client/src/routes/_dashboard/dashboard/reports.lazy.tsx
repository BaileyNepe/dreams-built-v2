import { createLazyFileRoute } from '@tanstack/react-router';
import { Report } from 'features/Reports';

function RouteComponent() {
  return <Report />;
}

export const Route = createLazyFileRoute('/_dashboard/dashboard/reports')({
  component: RouteComponent
});
