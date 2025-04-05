import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_landing/services')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_landing/services"!</div>
}
