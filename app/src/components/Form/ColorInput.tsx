import { type FC, forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  superscript?: string
}
export const ColorInput: FC<InputProps> = forwardRef<
  HTMLInputElement,
  InputProps
>((props, ref) => (
  <div className="w-full">
    <label
      className=" block text-sm font-medium text-gray-700"
      htmlFor={props.id ?? props.name}
    >
      {props.label}
    </label>
    <input
      type="color"
      ref={ref}
      id={props.id ?? props.name}
      className="mb-2 mt-2  h-10 w-14 cursor-pointer appearance-none rounded-md border-0 border-gray-200 p-1 px-2 py-1 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300  focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50"
      {...props}
    />
    {props.error && <p className="mt-1 text-xs text-red-500">{props.error}</p>}
  </div>
))
