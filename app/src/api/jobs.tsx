import { notify } from 'libs/toast'
import { api } from 'trpc/react'
import { type Pagination } from 'utils/types'

export const useJobsList = (p: Pagination) =>
  api.jobs.list.useSuspenseQuery(p)[0]

export const useSimpleJobsList = () =>
  api.jobs.simpleList.useSuspenseQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  })[0]

export const useJob = (id: string) => api.jobs.get.useSuspenseQuery(id)[0]

export const useEditJob = () =>
  api.jobs.update.useMutation({
    onError: (error) => {
      notify(error.message, { type: 'error' })
    },
  })

export const useDeleteJob = () =>
  api.jobs.delete.useMutation({
    onError: (error) => {
      notify(error.message, { type: 'error' })
    },
  })

export const useGetNextJobNumber = () =>
  api.jobs.getNextJobNumber.useSuspenseQuery()[0]
export const useCreateJob = () =>
  api.jobs.create.useMutation({
    onError: (error) => {
      notify(error.message, { type: 'error' })
    },
    onSuccess: () => {
      notify('Job created successfully')
    },
  })
