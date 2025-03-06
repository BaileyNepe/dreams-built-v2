/* eslint-disable @typescript-eslint/no-use-before-define */
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_dashboard/dashboard/')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hetestboard"!</div>;
}
