import { site } from '#/lib/site'
import { Socials } from './Socials'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-10 sm:flex-row-reverse sm:justify-between sm:px-6 lg:px-8">
        <Socials />
        <p className="text-sm text-muted-foreground">
          © 2015 – {new Date().getFullYear()} {site.company} Ltd. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
