import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_dashboard/dashboard/projects/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/projects"!</div>
}
