import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const list = protectedProcedure()
  .input(
    z.object({
      page: z.number().min(1).catch(1),
      perPage: z.number().min(1).catch(100),
    }),
  )
  .query(({ ctx, input }) =>
    ctx.db.client.findMany({
      take: input.perPage,
      skip: (input.page - 1) * input.perPage,
    }),
  )
const createClient = protectedProcedure()
  .input(
    z.object({
      name: z.string(),

      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    }),
  )
  .mutation(({ ctx, input }) =>
    ctx.db.client.create({
      data: {
        name: input.name,
        color: input.color,
      },
    }),
  )

const getClient = protectedProcedure()
  .input(z.string().cuid())
  .query(async ({ ctx, input }) =>
    ctx.db.client.findUniqueOrThrow({
      where: {
        id: input,
      },
    }),
  )

const editClient = protectedProcedure()
  .input(
    z.object({
      id: z.string().cuid(),
      name: z.string(),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    }),
  )
  .mutation(({ ctx, input }) =>
    ctx.db.client.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        color: input.color,
      },
    }),
  )

export const clientRouter = createTRPCRouter({
  list,
  create: createClient,
  get: getClient,
  update: editClient,
})
