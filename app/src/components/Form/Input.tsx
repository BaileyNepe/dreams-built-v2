import { type FC, forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  superscript?: string
}
export const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <div className="w-full">
      <label
        className=" block text-sm font-medium text-gray-700"
        htmlFor={props.id ?? props.name}
      >
        {props.label}
        {props.superscript && <sup>{props.superscript}</sup>}
      </label>
      <input
        ref={ref}
        id={props.id ?? props.name}
        className="mb-2 mt-2 w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        {...props}
      />
      {props.error && (
        <p className="mt-1 text-xs text-red-500">{props.error}</p>
      )}
    </div>
  ),
)
