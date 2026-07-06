import { Link, type LinkProps } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export interface FeatureSectionProps {
  title: string
  description: string
  videoUrl: string
  imageUrl: string
  imageAlt: string
  buttonText: string
  buttonLink: LinkProps['to']
}

export function FeatureSection({
  title,
  description,
  videoUrl,
  imageUrl,
  imageAlt,
  buttonText,
  buttonLink,
}: FeatureSectionProps) {
  return (
    <section className="relative h-[100dvh] w-full overflow-hidden">
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover sm:hidden"
      />
      <video
        src={videoUrl}
        poster={imageUrl}
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 hidden h-full w-full object-cover sm:block"
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-center gap-6 px-4 text-center text-white sm:px-6 lg:px-8">
        <h1 className="text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-base text-white/85 sm:text-lg md:text-xl">
          {description}
        </p>
        <div className="mt-4 flex justify-center">
          <Button asChild size="xl" variant="accent">
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
