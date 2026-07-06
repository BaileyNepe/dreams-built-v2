import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Quote, Star } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { paths } from '#/lib/paths'
import driveway from '#/assets/driveway.webp'

const FOUNDING_YEAR = 2015

const COMPANY_STATS = [
  {
    label: 'Projects completed',
    total: 600,
    content:
      'Completed projects across the Waikato region, from small residential slabs to large-scale commercial foundations in Hamilton and beyond.',
  },
  {
    label: 'Happy clients',
    total: 550,
    content:
      'Homeowners, developers, and commercial clients who trust Dreams Built for reliable, high-quality concrete and construction work.',
  },
  {
    label: 'Years of experience',
    total: new Date().getFullYear() - FOUNDING_YEAR,
    content:
      'Years of hands-on experience in concrete foundations, driveways, patios, and landscaping across Waikato and Hamilton.',
  },
]

const VALUES = [
  {
    title: 'Quality',
    tagline: 'No shortcuts, ever.',
    description:
      'Every pour, every finish, every job meets the highest standards of craftsmanship. We use quality materials and proven techniques because your foundation is the most important part of your build.',
  },
  {
    title: 'Integrity',
    tagline: 'Straight talk, always.',
    description:
      'Honesty and transparency are at the core of everything we do. You get clear pricing, honest timelines, and straightforward communication from the first call to final sign-off.',
  },
  {
    title: 'Reliability',
    tagline: 'We show up. We deliver.',
    description:
      'When we make a commitment, we keep it. Our clients count on us to show up on time, work consistently, and finish what we start — on schedule and on budget.',
  },
  {
    title: 'Innovation',
    tagline: 'Better ways to build.',
    description:
      'We continuously improve our techniques, materials, and processes. From modern concrete mixes to more efficient site management, we look for smarter ways to deliver better results.',
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

const TESTIMONIALS = [
  {
    quote:
      "Dreams Built transformed our property with a beautiful new driveway and patio. The team was professional, the work was completed on time, and the quality is outstanding. Couldn't be happier!",
    author: 'Hannah V.',
    location: 'Hamilton',
  },
  {
    quote:
      'When we needed a solid foundation for our new home, Dreams Built delivered beyond our expectations. Their attention to detail and expertise gave us confidence throughout the entire building process.',
    author: 'Kelly S.',
    location: 'Morrinsville',
  },
  {
    quote:
      'The team at Dreams Built exceeded our expectations with their professionalism and quality of work. Our new patio looks fantastic! We highly recommend them for any concrete work.',
    author: 'John E.',
    location: 'Hamilton',
  },
]

function formatNumber(n: number) {
  if (n >= 1000) {
    const v = n / 1000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`
  }
  return String(n)
}

function AboutComponent() {
  return (
    <>
      <section className="relative flex h-[30rem] items-center justify-center overflow-hidden">
        <img
          src={driveway}
          alt="Dreams Built concrete driveway in Waikato"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center text-white">
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Waikato's Trusted Concrete Specialists
          </h1>
          <p className="mx-auto max-w-3xl text-balance text-base text-white/80 sm:text-lg">
            Founded in {FOUNDING_YEAR}, Dreams Built has grown from a small
            family operation into one of the Waikato region's most trusted names
            in concrete foundations and construction. We're proud of every job
            we've completed across Hamilton, Morrinsville, Cambridge, and
            beyond.
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
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Our Values
          </h2>
          <p className="text-muted-foreground">
            These aren't just words on a wall — they're the principles our team
            brings to every job, every day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <Card
              key={value.title}
              className="h-full border-t-[3px] border-t-primary p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-primary">{value.title}</h3>
              <p className="mt-1 text-sm font-semibold italic text-muted-foreground">
                {value.tagline}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {value.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 md:gap-16 lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Our Story
            </h2>
            <div className="mt-6 space-y-4 text-base text-muted-foreground">
              <p>
                Dreams Built started in {FOUNDING_YEAR} as a small family
                operation focused on residential foundations in the Waikato.
                Word spread quickly — quality work, honest pricing, and a team
                that actually shows up — and our reputation grew alongside our
                capabilities.
              </p>
              <p>
                Over the years we've taken on larger commercial foundations for
                Hamilton subdivisions and rural Waikato builds, expanded into
                driveways, patios, fencing, and landscaping, and built a team of
                experienced tradespeople who share the same standards we started
                with.
              </p>
              <p>
                Today, Dreams Built works on everything from single-house slabs
                in Cambridge to multi-lot foundation packages in Hamilton — but
                the approach hasn't changed: quality materials, correct
                technique, and a job finished to a standard we're proud to put
                our name on.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            {COMPANY_STATS.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-4 md:flex-row md:items-center"
              >
                <div className="grid w-full max-w-[110px] gap-1">
                  <div className="grid grid-cols-[max-content_max-content] items-start text-3xl font-bold">
                    <span>{formatNumber(row.total)}</span>
                    <span className="-mt-4 ml-0.5 text-lg text-amber-500">
                      +
                    </span>
                  </div>
                  <p className="justify-self-start text-left text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </p>
                </div>
                <p className="flex-1 border-l border-dashed border-border pl-4 text-sm text-muted-foreground md:ml-4">
                  {row.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground">
            Hear from some of the homeowners and businesses we've worked with
            across Waikato.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={testimonial.author}
              className="h-full border-l-4 border-l-primary p-8"
            >
              <Quote className="h-8 w-8 text-primary/20" />
              <div className="mt-2 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mt-4 text-base text-foreground">
                {testimonial.quote}
              </p>
              <p className="mt-4 text-sm font-bold">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.location}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Ready to Work with Us?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">
            Whether it's a new home foundation, a commercial build, or a
            driveway renovation, we'd love to hear about your project. Get in
            touch for a free, no-obligation quote.
          </p>
          <div className="mt-8">
            <Button asChild size="xl" variant="accent">
              <Link to={paths.contact}>
                Contact Us Today
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export const Route = createFileRoute('/_landing/about')({
  head: () => ({
    meta: [
      {
        title: "About Us | Dreams Built – Waikato's Trusted Concrete Specialists",
      },
      {
        name: 'description',
        content:
          'Learn about Dreams Built — a Waikato-based concrete and construction company founded in 2015. 600+ projects completed across Hamilton, Morrinsville, Cambridge and the wider Waikato region.',
      },
    ],
  }),
  component: AboutComponent,
})
