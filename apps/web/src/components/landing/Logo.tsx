import { cn } from '#/lib/utils'
import { site } from '#/lib/site'
import darkLogo from '#/assets/logo_dark.webp'
import lightLogo from '#/assets/light.webp'

export function Logo({
  light = false,
  className,
}: {
  light?: boolean
  className?: string
}) {
  return (
    <img
      src={light ? lightLogo : darkLogo}
      alt={site.company}
      className={cn('h-auto w-[120px] select-none', className)}
    />
  )
}
