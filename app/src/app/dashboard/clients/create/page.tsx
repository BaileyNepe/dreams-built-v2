'use client'
import { Button } from 'components/Button'
import { Input } from 'components/Form/Input'
import { useRouter } from 'next/navigation'
import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { api } from 'trpc/react'
import { paths } from 'utils/paths'

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
