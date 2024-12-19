import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/dashboard/projects/create"!</div>
}
