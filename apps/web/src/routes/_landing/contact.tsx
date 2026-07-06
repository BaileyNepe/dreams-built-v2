import { createFileRoute } from '@tanstack/react-router'

import { ContactSection } from '#/components/landing/Contact'
import contactBg from '#/assets/contact.webp'

function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={contactBg}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover blur-md"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/55" />

      <div className="flex w-full justify-center px-4 pb-20 pt-32 sm:px-6 md:pt-40 lg:px-8">
        <ContactSection />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_landing/contact')({
  head: () => ({
    meta: [
      {
        title: 'Get a Free Quote | Dreams Built – Hamilton & Waikato, NZ',
      },
      {
        name: 'description',
        content:
          'Contact Dreams Built for a free, no-obligation quote. We service Hamilton, Morrinsville, Cambridge, Te Awamutu and the wider Waikato region. Call or fill in our online form.',
      },
    ],
  }),
  component: ContactPage,
})
