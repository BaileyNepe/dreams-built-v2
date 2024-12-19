import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/$projectId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/dashboard/projects/$projectId"!</div>
}
