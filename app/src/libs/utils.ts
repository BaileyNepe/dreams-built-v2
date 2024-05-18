import { createId } from '@paralleldrive/cuid2'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const generateCuid = () => createId()

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const classNames = (...classes: string[]) =>
  classes.filter(Boolean).join(' ')
