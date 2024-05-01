'use client'

import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/20/solid'
import {
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Loader } from 'components/Loader'
import { Logo } from 'components/Logo'
import { Profile } from 'components/Profile'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type FC, Fragment, useState } from 'react'
import { type paths } from 'utils/paths'

const navigation: {
  name: string
  href: (typeof paths)[keyof typeof paths]
  icon: React.ComponentType<React.ComponentProps<'svg'>>
}[] = [
  { name: 'Dashboard', href: '/dashboard', icon: FolderIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: ServerIcon },
  { name: 'Timesheet', href: '/dashboard/timesheet', icon: SignalIcon },
  { name: 'Schedule', href: '/dashboard/schedule', icon: GlobeAltIcon },
]

const NavBar: FC = () => {
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
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
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

const Header: FC<{ openSidebar: () => void }> = ({ openSidebar }) => (
  <div className="sticky flex h-16 w-full items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
    <button
      type="button"
      className="-m-2.5 p-2.5 text-white xl:hidden"
      onClick={openSidebar}
    >
      <span className="sr-only">Open sidebar</span>
      <Bars3Icon className="h-5 w-5" aria-hidden="true" />
    </button>

    <div className="flex w-full flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6 ">
      <Profile />
    </div>
  </div>
)

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 xl:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>

                <NavBar />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <NavBar />
      </div>

      <div className="xl:pl-72">
        <Header openSidebar={() => setSidebarOpen(true)} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

const RootLayout = withPageAuthRequired(Layout, {
  returnTo: '/',
  onRedirecting: () => (
    <Layout>
      <Loader />
    </Layout>
  ),
})

export default RootLayout
