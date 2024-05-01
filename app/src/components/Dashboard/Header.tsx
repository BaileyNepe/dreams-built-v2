import { Bars3Icon } from '@heroicons/react/20/solid'
import { Profile } from 'components/Profile'
import { type FC } from 'react'

export const Header: FC<{ openSidebar: () => void }> = ({ openSidebar }) => (
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
