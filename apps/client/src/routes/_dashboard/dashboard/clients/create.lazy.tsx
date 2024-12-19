import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/clients/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/dashboard/clients/create"!</div>
}
