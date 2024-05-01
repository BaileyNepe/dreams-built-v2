import { useParams } from 'next/navigation'

export const useParamId = () => {
  const { id } = useParams()
  if (!id || typeof id !== 'string') {
    throw new Error('No id found in params')
  }
  return id
}
