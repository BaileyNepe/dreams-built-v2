import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { CallToAction } from '@/components/Sections/CallToAction'
import { Faqs } from '@/components/Sections/Faqs'
import { Hero } from '@/components/Sections/Hero'
import { Pricing } from '@/components/Sections/Pricing'
import { PrimaryFeatures } from '@/components/Sections/PrimaryFeatures'
import { SecondaryFeatures } from '@/components/Sections/SecondaryFeatures'
import { Testimonials } from '@/components/Sections/Testimonials'
import { unstable_noStore as noStore } from 'next/cache'

export default async function Home() {
  noStore()

  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Testimonials />
        <Pricing />
        <Faqs />
      </main>
      <Footer />
    </>
  )
}
