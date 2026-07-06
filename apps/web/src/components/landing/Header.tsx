import { useState } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { cn } from '#/lib/utils'
import { paths } from '#/lib/paths'
import { useScrolled } from '#/hooks/useScrolled'
import { Logo } from './Logo'

const links: Array<{ to: LinkProps['to']; label: string }> = [
  { to: paths.home, label: 'Home' },
  { to: paths.services, label: 'Services' },
  { to: paths.about, label: 'About' },
  { to: paths.contact, label: 'Contact Us' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled(40)
  const lightMode = !scrolled

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,box-shadow] duration-200',
        scrolled
          ? 'bg-background/85 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to={paths.home} aria-label="Home" className="flex items-center">
            <Logo light={lightMode} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors',
                  lightMode
                    ? 'text-white/85 hover:text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                activeProps={{
                  className: cn(
                    'text-sm font-medium',
                    lightMode ? 'text-white' : 'text-foreground',
                  ),
                }}
                activeOptions={{ exact: link.to === paths.home }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button asChild variant="accent" size="default">
              <Link to={paths.contact}>Contact Us</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                className={cn(
                  lightMode ? 'text-white hover:bg-white/10' : 'text-foreground',
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      className="rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild variant="accent" size="lg" className="mt-4">
                    <Link to={paths.contact}>Get a Free Quote</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
