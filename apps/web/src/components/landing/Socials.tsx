import { Facebook, Linkedin } from 'lucide-react'

import { cn } from '#/lib/utils'
import { site } from '#/lib/site'

export function Socials({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <a
        href={site.socials.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.company} on Facebook`}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <Facebook className="h-5 w-5" />
      </a>
      <a
        href={site.socials.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.company} on LinkedIn`}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <Linkedin className="h-5 w-5" />
      </a>
    </div>
  )
}
