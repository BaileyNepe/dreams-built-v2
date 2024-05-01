'use client'
import { Button } from 'components/Button'
import { useRouter } from 'next/navigation'
import { forwardRef, type FC, type InputHTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { api } from 'trpc/react'
import { paths } from 'utils/paths'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}
const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <>
      <label
        className="block text-sm font-medium text-gray-700"
        htmlFor={props.id ?? props.name}
      >
        {props.label}
      </label>
      <input
        ref={ref}
        id={props.id ?? props.name}
        className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-56 sm:text-sm sm:leading-6"
        {...props}
      />
      {props.error && (
        <p className="mt-1 text-xs text-red-500">{props.error}</p>
      )}
    </>
  ),
)

const CreateClient: FC = () => {
  const create = api.client.create.useMutation()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      color: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => {
        create.mutate(data, {
          onSuccess: () => {
            router.push(paths.clients)
          },
        })
      })}
    >
      <Input
        label="Name"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <Input
        label="Color"
        type="color"
        error={errors.color?.message}
        {...register('color', { required: 'Color is required' })}
      />

      <Button type="submit" variant="block" color="indigo">
        Create
      </Button>
    </form>
  )
}

export default CreateClient
