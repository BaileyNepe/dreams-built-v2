import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { paths } from '#/lib/paths'
import contactImg from '#/assets/contact.webp'
import drivewayExposed from '#/assets/driveway_2.webp'
import fence from '#/assets/fence.webp'
import foundations from '#/assets/foundations.webp'
import foundationsComplete from '#/assets/foundations_complete.webp'
import landscape from '#/assets/landscape.webp'
import patio from '#/assets/patio.webp'
import repair from '#/assets/repair.webp'
import repair2 from '#/assets/repair_2.webp'

const FOUNDATION_SERVICES = [
  {
    title: 'Residential Foundations',
    tag: 'Residential',
    description:
      'Engineered concrete slabs, strip footings, and raft foundations for new home builds across Waikato and Hamilton — built to last decades and meet all consent requirements.',
    backgroundImage: foundationsComplete,
  },
  {
    title: 'Commercial Foundations',
    tag: 'Commercial',
    description:
      'Heavy-duty foundations for commercial and industrial builds. We work with engineers and project managers to meet code requirements and tight construction schedules.',
    backgroundImage: contactImg,
  },
  {
    title: 'Foundation Repair',
    tag: 'Repair',
    description:
      'Cracked, settling, or subsiding foundations restored to full structural integrity. We diagnose the cause and apply lasting solutions, not just surface patches.',
    backgroundImage: repair,
  },
  {
    title: 'Concrete Slabs',
    tag: 'Slabs',
    description:
      'Precision-poured slabs for garages, sheds, sleepouts, and outbuildings. Reinforced and finished to a high standard with proper drainage and moisture barriers.',
    backgroundImage: foundations,
  },
]

const ADDITIONAL_SERVICES = [
  {
    title: 'Driveways & Patios',
    tag: 'Outdoor Living',
    description:
      'Exposed aggregate, broom-finish, and coloured concrete driveways and patios designed to boost kerb appeal and withstand the Waikato climate year-round.',
    backgroundImage: drivewayExposed,
  },
  {
    title: 'Fencing Solutions',
    tag: 'Fencing',
    description:
      'Concrete and timber fence installations for privacy, security, and boundary definition. We handle everything from posts to panels with a clean, durable finish.',
    backgroundImage: fence,
  },
  {
    title: 'Landscaping',
    tag: 'Landscaping',
    description:
      'Retaining walls, garden borders, paths, and outdoor feature work that integrates with your property and stands up to everyday use.',
    backgroundImage: landscape,
  },
  {
    title: 'Project Consulting',
    tag: 'Consulting',
    description:
      'Not sure where to start? We offer practical, no-nonsense advice on concrete specifications, consents, sequencing, and cost planning before a single shovel hits the ground.',
    backgroundImage: repair2,
  },
]

const WHY_HIGHLIGHTS = [
  {
    stat: '600+',
    label: 'Projects completed',
    detail: 'Across Waikato and Hamilton',
  },
  {
    stat: 'Free',
    label: 'No-obligation quotes',
    detail: 'On-site assessment at no cost',
  },
  {
    stat: 'Local',
    label: 'Waikato-based team',
    detail: 'Hamilton, Morrinsville, Cambridge & beyond',
  },
]

const PROCESS_STEPS = [
  {
    title: 'Consultation & Quote',
    description:
      'We visit your site, understand your requirements, and provide a detailed, transparent quote — no hidden costs.',
  },
  {
    title: 'Planning & Consent',
    description:
      'We coordinate consents, engineer sign-offs, and material sourcing so everything is in place before work begins.',
  },
  {
    title: 'Construction',
    description:
      'Our experienced crew gets to work with quality materials, correct techniques, and attention to every detail.',
  },
  {
    title: 'Completion & Sign-off',
    description:
      'We handle required inspections and walk through the finished work with you before calling the job done.',
  },
]

function ServiceCard({
  backgroundImage,
  tag,
  title,
  description,
}: {
  backgroundImage: string
  tag: string
  title: string
  description: string
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-xl p-8 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <img
        src={backgroundImage}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/70 transition-colors duration-300 group-hover:bg-black/60" />
      <div className="relative z-10 flex h-full flex-col">
        <Badge variant="soft" className="mb-4 self-start">
          {tag}
        </Badge>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-white/80">{description}</p>
      </div>
    </div>
  )
}

function ServicesPage() {
  return (
    <>
      <section className="relative flex h-[30rem] items-center justify-center overflow-hidden">
        <img
          src={patio}
          alt="Dreams Built concrete services in Waikato"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center text-white">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Expert Concrete & Construction Services in Waikato
          </h1>
          <p className="mx-auto max-w-3xl text-balance text-base text-white/80 sm:text-lg">
            From engineered foundations to exposed aggregate driveways, Dreams
            Built delivers quality concrete work across Hamilton, Morrinsville,
            Cambridge, Te Awamutu, and the wider Waikato region.
          </p>
        </div>
      </section>

      <section className="bg-primary py-10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-y-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {WHY_HIGHLIGHTS.map((item, i) => (
            <div
              key={item.stat}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-4 text-center',
                i !== WHY_HIGHLIGHTS.length - 1 &&
                  'md:border-r md:border-white/15',
              )}
            >
              <p className="text-3xl font-extrabold leading-none text-accent">
                {item.stat}
              </p>
              <p className="mt-1 text-base font-bold text-white">
                {item.label}
              </p>
              <p className="text-sm text-white/60">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Foundation Services
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Our core expertise — solid, lasting concrete foundations for every
          type of structure and terrain across the Waikato.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FOUNDATION_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Our Process
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              How We Work
            </h2>
            <p className="text-muted-foreground">
              A clear, structured process means no surprises — just quality work
              delivered on time and within budget.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="relative py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
                {i < PROCESS_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute right-0 top-10 hidden h-0.5 w-8 -translate-x-4 bg-border lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Additional Services
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Beyond foundations, we handle everything your property needs —
          driveways, patios, fencing, landscaping, and more.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ADDITIONAL_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to Start Your Project?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
            Get in touch for a free, no-obligation quote. We work across
            Hamilton, Morrinsville, Cambridge, Te Awamutu, and the wider
            Waikato.
          </p>
          <div className="mt-8">
            <Button asChild size="xl" variant="accent">
              <Link to={paths.contact}>
                Get a Free Quote
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export const Route = createFileRoute('/_landing/services')({
  head: () => ({
    meta: [
      {
        title:
          'Concrete & Construction Services | Dreams Built – Waikato & Hamilton, NZ',
      },
      {
        name: 'description',
        content:
          'Expert concrete foundations, driveways, patios, fencing and landscaping in Waikato and Hamilton, NZ. Residential and commercial. Contact Dreams Built for a free quote.',
      },
    ],
  }),
  component: ServicesPage,
})
