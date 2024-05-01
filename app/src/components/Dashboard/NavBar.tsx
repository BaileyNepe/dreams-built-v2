import { Logo } from 'components/Logo'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type FC } from 'react'
import { routes } from './routes'

export const NavBar: FC = () => {
  const path = usePathname()

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 ring-white/5">
      <div className="flex h-16 shrink-0 items-center">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {routes.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href as string}
                    className={`${
                      path === item.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white'
                    }
                      group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 hover:bg-gray-800`}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
