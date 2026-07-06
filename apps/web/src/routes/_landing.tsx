import { Outlet, createFileRoute } from '@tanstack/react-router'

import { Header } from '#/components/landing/Header'
import { Footer } from '#/components/landing/Footer'

function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/_landing')({
  component: LandingLayout,
})
