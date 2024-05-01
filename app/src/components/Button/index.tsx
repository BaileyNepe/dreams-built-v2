import clsx from 'clsx'
import Link from 'next/link'

const baseStyles = {
  solid:
    'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'group inline-flex ring-1 items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-none',
  block:
    'block px-3 py-2 text-center text-sm font-semibold rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
}

const variantStyles = {
  solid: {
    indigo:
      'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500  focus-visible:outline-indigo-600',
    slate:
      'bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
    blue: 'bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
    white:
      'bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',
  },
  outline: {
    slate:
      'ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
    white:
      'ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
    blue: 'ring-blue-500 text-blue-500 hover:ring-blue-600 active:ring-blue-700 active:text-blue-700 focus-visible:outline-blue-600',
    indigo:
      'ring-indigo-500 text-indigo-500 hover:ring-indigo-600 active:ring-indigo-700 active:text-indigo-700 focus-visible:outline-indigo-600',
  },
  block: {
    indigo:
      'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500  focus-visible:outline-indigo-600',
    slate:
      'bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
    blue: 'bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
    white:
      'bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',
  },
}

type ButtonProps = (
  | {
      variant?: 'solid'
      color?: keyof typeof variantStyles.solid
    }
  | {
      variant: 'outline'
      color?: keyof typeof variantStyles.outline
    }
  | {
      variant: 'block'
      color?: keyof typeof variantStyles.solid
    }
) &
  (
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
    | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
        href?: undefined
      })
  )

export function Button({ className, ...props }: ButtonProps) {
  props.variant ??= 'solid'
  props.color ??= 'slate'

  let importedClass = className

  importedClass = clsx(
    baseStyles[props.variant],
    variantStyles[props.variant][props.color],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={importedClass} {...props} />
  ) : (
    <Link className={importedClass} {...props} />
  )
}
