import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { FC } from 'react'

export const Boolean: FC<{ value: boolean }> = ({ value }) => {
  return value ? (
    <CheckIcon className="h-5 w-5 text-green-500" />
  ) : (
    <XMarkIcon className="h-5 w-5 text-red-500" />
  )
}
