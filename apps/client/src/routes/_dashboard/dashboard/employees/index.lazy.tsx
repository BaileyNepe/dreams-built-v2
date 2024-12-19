import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/dashboard/employees/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/employees"!</div>
}
