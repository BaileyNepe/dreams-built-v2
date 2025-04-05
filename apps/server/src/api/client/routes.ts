import { protectedProcedure, trpc } from '@config/trpc';
import { clientSchema } from '@dreams-built/shared/src/schemas';

import { authz } from '@dreams-built/shared/src/auth/permissions';
import { PaginationSchema } from '@dreams-built/shared/src/pagination/types';
import { type Prisma } from '@prisma/client';
import { z } from 'zod';

export const clientRouter = trpc.router({
  list: protectedProcedure([authz.clients_read])
    .input(PaginationSchema)
    .query(async ({ ctx, input }) => {
      const whereParams: Prisma.ClientWhereInput = input.query
        ? { name: { contains: input.query, mode: 'insensitive' } }
        : {};

      const clients = await ctx.db.client.findMany({
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
        where: whereParams,

        select: {
          id: true,
          name: true,
          color: true
        }
      });

      const total = await ctx.db.client.count({
        where: whereParams
      });

      return {
        clients,
        total
      };
    }),
  create: protectedProcedure([authz.clients_edit])
    .input(clientSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.client.create({
        data: {
          name: input.name,
          color: input.color
        }
      })
    ),
  get: protectedProcedure([authz.clients_read])
    .input(z.string().cuid())
    .query(async ({ ctx, input }) =>
      ctx.db.client.findUniqueOrThrow({
        where: {
          id: input
        }
      })
    ),
  update: protectedProcedure([authz.clients_edit])
    .input(
      z
        .object({
          id: z.string().cuid()
        })
        .and(clientSchema)
    )
    .mutation(({ ctx, input }) =>
      ctx.db.client.update({
        where: {
          id: input.id
        },
        data: {
          name: input.name,
          color: input.color
        }
      })
    )
});
