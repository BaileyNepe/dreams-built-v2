import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { paths } from '#/lib/paths'

const ROWS = [
  {
    label: 'Foundations completed',
    total: 600,
    content:
      'From basic residential foundations to complex engineered foundation systems, we have successfully delivered hundreds of quality concrete foundations that stand the test of time.',
  },
  {
    label: 'Happy homeowners',
    total: 550,
    content:
      'Our commitment to excellence has made us the trusted choice for residential concrete foundations. We provide the solid base upon which homeowners build their dreams.',
  },
  {
    label: 'Years of expertise',
    total: new Date().getFullYear() - 1996,
    content:
      'With decades specialising in concrete foundation work, our certified technicians bring unmatched expertise to every pour, ensuring structural integrity and precision in every project.',
  },
]

function formatNumber(n: number) {
  if (n >= 1000) {
    const v = n / 1000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`
  }
  return String(n)
}

export function LandingAbout() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-32 lg:px-8">
      <div className="grid gap-16 md:grid-cols-[0.8fr_1fr] md:gap-24">
        <div className="text-center md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            About us
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Who We Are
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Since 2015, Dreams Built has been the premier provider of
            residential concrete foundations throughout the region. We
            specialise in durable, precise foundation systems that ensure the
            structural integrity of your home for generations. Our team combines
            traditional craftsmanship with modern techniques and materials,
            delivering foundations that exceed building codes and homeowner
            expectations. Every project begins with meticulous site evaluation
            and ends with a foundation you can trust.
          </p>
          <div className="mt-8">
            <Button asChild variant="ghost" size="sm">
              <Link to={paths.about}>
                Learn more
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[6rem_1fr] items-start gap-4 text-center md:flex md:items-center md:text-left"
            >
              <div className="grid w-full max-w-[100px] gap-1">
                <div className="grid grid-cols-[max-content_max-content] items-start text-3xl font-bold">
                  <span>{formatNumber(row.total)}</span>
                  <span className="-mt-4 ml-0.5 text-lg text-accent">+</span>
                </div>
                <p className="justify-self-start text-left text-[0.65rem] font-semibold uppercase tracking-wide leading-relaxed text-muted-foreground">
                  {row.label}
                </p>
              </div>
              <p className="flex-1 border-l border-dashed border-border py-4 pl-4 text-left text-sm text-muted-foreground md:ml-4 md:pl-4">
                {row.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
