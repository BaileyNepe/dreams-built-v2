import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/dashboard/schedule')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/schedule"!</div>
}
