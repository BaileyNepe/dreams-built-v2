import { api } from 'trpc/react'

export const useUsers = () => api.user.list.useSuspenseQuery()[0]
