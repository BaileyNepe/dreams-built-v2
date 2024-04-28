import { createTRPCRouter, protectedProcedure } from '../trpc'

const list = protectedProcedure().query(({ ctx }) => {
  return ctx.user
})

export const clientRouter = createTRPCRouter({
  list,
})
