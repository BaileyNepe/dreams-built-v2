import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard/dashboard/project-parts')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/_dashboard/project-parts"!</div>;
}
