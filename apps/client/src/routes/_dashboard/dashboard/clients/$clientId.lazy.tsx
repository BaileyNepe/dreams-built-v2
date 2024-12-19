import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/clients/$clientId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/dashboard/clients/$clientId"!</div>
}
