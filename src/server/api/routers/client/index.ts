import { type Prisma } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const clientsRouter = createTRPCRouter({
  list: protectedProcedure()
    .input(
      z.object({
        limit: z.number().default(25),
        page: z.number().default(1),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, page } = input;
      const search = input.search || '';

      const whereClause: Prisma.clientsWhereInput = search
        ? {
            OR: [{ clientName: { contains: search, mode: 'insensitive' } }],
          }
        : {};

      const count = await ctx.prisma.clients.count({ where: whereClause });

      const clientList = await ctx.prisma.clients.findMany({
        where: whereClause,
        skip: limit * (page - 1),
        take: limit,
      });

      return { clientList, pages: Math.ceil(count / limit) };
    }),
});
