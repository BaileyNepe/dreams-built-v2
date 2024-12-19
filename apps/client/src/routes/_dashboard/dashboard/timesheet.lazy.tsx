import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/dashboard/timesheet')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/timesheet"!</div>
}
