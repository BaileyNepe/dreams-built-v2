import { PlusIcon } from '@heroicons/react/20/solid'
import React, { FC, PropsWithChildren } from 'react'
import { Button } from '../Button'

const PageLayout: FC<
  PropsWithChildren & {
    title: string
    onClick?: () => void
    description?: string
  }
> = ({ children, title, onClick, description }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {onClick && (
            <Button onClick={onClick} color="indigo" variant="block">
              Add <PlusIcon className="inline-block h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default PageLayout
