'use client'
import { useClientList } from 'api/clients'
import { useCreateJob, useGetNextJobNumber } from 'api/jobs'
import { Button } from 'components/Button'
import { Input } from 'components/Form/Input'
import { Select } from 'components/Form/Select'
import { useForm } from 'react-hook-form'

const JobCreate = () => {
  const { mutate } = useCreateJob()
  const clients = useClientList({
    page: 1,
    perPage: 10,
  })
  const latestJob = useGetNextJobNumber()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: '',
      city: '',
      area: 0,
      endClient: '',
      clientId: '',
      color: '',
      jobNumber: latestJob,
    },
  })

  const options = clients.map((client) => ({
    label: client.name,
    value: client.id,
  }))

  return (
    <form
      onSubmit={handleSubmit((data) => {
        mutate(data)
      })}
    >
      <Input {...register('jobNumber')} label="Job Number" type="number" />
      <Input
        {...register('clientId', {
          required: 'Client is required',
        })}
        error={errors.clientId?.message}
        label="Client"
        placeholder="Client"
      />
      <Input
        {...register('endClient')}
        label="End Client"
        error={errors.endClient?.message}
        placeholder="End Client"
      />
      <Input
        {...register('address', {
          required: 'Address is required',
        })}
        error={errors.address?.message}
        label="Address"
        placeholder="Address"
      />
      <Input {...register('city')} label="City" placeholder="City" />
      <Input
        error={errors.color?.message}
        {...register('color', {
          required: 'Color is required',
          validate: (value) =>
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ||
            'Color must be a valid hex color',
        })}
        label="Color"
        placeholder="Color"
      />

      <Select
        name="clientId"
        label="Client"
        options={options}
        control={control}
      />

      <Input
        {...register('area')}
        label="Area m"
        superscript="2"
        placeholder="Area"
      />
      <Button type="submit">Create Job</Button>
    </form>
  )
}
export default JobCreate
