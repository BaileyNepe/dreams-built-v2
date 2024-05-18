'use client'
import { useClientList } from 'api/clients'
import { useCreateJob, useGetNextJobNumber } from 'api/jobs'
import { Button } from 'components/Button'
import { ColorInput } from 'components/Form/ColorInput'
import { Input } from 'components/Form/Input'
import { SelectForm } from 'components/Form/Select'
import { notify } from 'libs/toast'
import { useForm } from 'react-hook-form'
import { generateRandomColor } from 'utils/color'

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
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: '',
      city: '',
      area: 0,
      endClient: '',
      clientId: { value: '', label: '' },
      color: generateRandomColor(),
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
        if (!data.clientId.value) {
          return notify('Client is required', { type: 'error' })
        }

        mutate(
          {
            ...data,
            clientId: data.clientId.value,
          },
          {
            onSuccess: (job) => {
              reset({
                address: '',
                city: '',
                area: 0,
                endClient: '',
                clientId: { value: '', label: '' },
                color: generateRandomColor(),
                jobNumber: job.nextJobNumber,
              })
            },
          },
        )
      })}
    >
      <Input
        {...register('jobNumber', {
          valueAsNumber: true,
          validate: (value) =>
            value >= 0 || 'Job Number must be greater than 0',
        })}
        label="Job Number"
        type="number"
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
          min: 3,
        })}
        error={errors.address?.message}
        label="Address"
        placeholder="Address"
      />
      <Input {...register('city')} label="City" placeholder="City" />
      <ColorInput
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

      <SelectForm
        label="Client"
        {...register('clientId', {
          required: 'Client is required',
        })}
        options={options}
        control={control}
      />

      <Input
        {...register('area', {
          valueAsNumber: true,
          validate: (value) => value >= 0 || 'Area must be greater than 0',
        })}
        label="Area m"
        error={errors.area?.message}
        type="number"
        superscript="2"
        placeholder="Area"
      />
      <Button type="submit">Create Job</Button>
    </form>
  )
}
export default JobCreate
