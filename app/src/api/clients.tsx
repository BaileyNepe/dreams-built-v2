import { api } from 'trpc/react'
import { useParamId } from 'utils/hooks/useParams'

export const useClientList = ({ page = 1, perPage = 10 }) =>
  api.client.list.useSuspenseQuery({
    page,
    perPage,
  })[0]

export const useClient = () => {
  const id = useParamId()
  return api.client.get.useSuspenseQuery(id)[0]
}

export const useEditClient = () => api.client.update.useMutation()
