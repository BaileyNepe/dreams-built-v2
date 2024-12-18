import { createLazyFileRoute } from '@tanstack/react-router';

function RouteComponent() {
  return <div>Hello "/_dashboard"!</div>;
}

export const Route = createLazyFileRoute('/_dashboard')({
  component: RouteComponent
});
