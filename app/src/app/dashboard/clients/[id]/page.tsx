'use client'

import { useClient, useEditClient } from 'api/clients'
import { Button } from 'components/Button'
import { Input } from 'components/Form/Input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { paths } from 'utils/paths'

const ClientEdit = () => {
  const client = useClient()
  const edit = useEditClient()
  const router = useRouter()

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      name: client.name,
      color: client.color,
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => {
        edit.mutate(
          {
            id: client.id,
            ...data,
          },
          {
            onSuccess: () => {
              router.push(paths.clients)
            },
          },
        )
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
        Edit
      </Button>
    </form>
  )
}
export default ClientEdit
