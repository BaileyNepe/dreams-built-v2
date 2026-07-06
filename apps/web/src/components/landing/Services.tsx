import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { cn } from '#/lib/utils'
import { paths } from '#/lib/paths'
import { Card } from '#/components/ui/card'

import commercialIcon from '#/assets/service/commercial.svg'
import concreteIcon from '#/assets/service/concrete.svg'
import drivewaysIcon from '#/assets/service/driveways.svg'
import fenceIcon from '#/assets/service/fence.svg'

const ACCENTS = [
  'text-sky-600 bg-sky-50',
  'text-orange-600 bg-orange-50',
  'text-emerald-600 bg-emerald-50',
  'text-amber-600 bg-amber-50',
] as const

const SERVICES = [
  {
    name: 'Commercial Foundations',
    icon: commercialIcon,
    content:
      'Expert concrete foundation solutions for commercial buildings, warehouses, and multi-unit residential properties.',
    path: paths.services,
  },
  {
    name: 'Concrete Driveways & Patios',
    icon: drivewaysIcon,
    content:
      'Custom concrete driveways, patios, and walkways built to enhance your property with durability and aesthetic appeal.',
    path: paths.services,
  },
  {
    name: 'Residential Foundations',
    icon: concreteIcon,
    content:
      'Quality concrete foundations for residential properties, ensuring structural integrity and longevity for your home construction.',
    path: paths.services,
  },
  {
    name: 'Fencing Solutions',
    icon: fenceIcon,
    content:
      "Professional fence installation services to secure and beautify your property, complementing your home's foundation and landscaping.",
    path: paths.services,
  },
]

export function LandingServices() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="mx-auto max-w-xl space-y-3 text-center md:mx-0 md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Our Services
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          We Provide
        </h2>
        <p className="text-muted-foreground">
          With decades of experience in concrete construction, we deliver
          high-quality foundations and concrete structures for residential and
          commercial properties. Our expert team ensures durability, structural
          integrity, and aesthetic excellence in every project.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((service, index) => (
          <Card
            key={service.name}
            className={cn(
              'group relative flex flex-col items-center p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
              index === 2 && 'lg:py-14 lg:shadow-md',
            )}
          >
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full',
                ACCENTS[index],
              )}
            >
              <img
                src={service.icon}
                alt=""
                aria-hidden
                className="h-10 w-10"
              />
            </div>

            <h3 className="mt-6 text-lg font-semibold">{service.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {service.content}
            </p>

            <Link
              to={service.path}
              aria-label={`Learn more about ${service.name}`}
              className={cn(
                'mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors',
                ACCENTS[index],
                'hover:brightness-95',
              )}
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
