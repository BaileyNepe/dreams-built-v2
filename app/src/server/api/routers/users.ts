import { getViewableUsers } from 'utils/auth/roles'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const getUsers = protectedProcedure().query(async ({ ctx }) => {
  const users = await ctx.db.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      image: true,
      lastName: true,
      role: true,
    },
  })

  const filteredUsers = getViewableUsers(new Set(ctx.userPermissions), users)

  return filteredUsers
})

export const userRouter = createTRPCRouter({
  list: getUsers,
})
