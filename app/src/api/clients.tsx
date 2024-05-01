import { api } from 'trpc/react'
import { useParamId } from 'utils/hooks/useParams'

export const useClient = () => {
  const id = useParamId()
  return api.client.get.useSuspenseQuery(id)[0]
}

export const useEditClient = () => api.client.update.useMutation()
