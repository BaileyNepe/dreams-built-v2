import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_landing/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_landing/contact"!</div>
}
