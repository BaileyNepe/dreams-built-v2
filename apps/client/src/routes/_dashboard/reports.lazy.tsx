import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/reports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/reports"!</div>
}
