/* eslint-disable camelcase */
import { type Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
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
  create: protectedProcedure()
    .input(
      z.object({
        clientName: z
          .string({
            invalid_type_error: 'Client name must be a string',
            required_error: 'Client name is required',
          })
          .nonempty({ message: 'Client name cannot be empty' }),
        color: z
          .string({
            invalid_type_error: 'Color must be a string',
            required_error: 'Color is required',
          })

          .regex(/^#([0-9a-f]{3}){1,2}$/i, {
            message: 'Color must be a valid hex color',
          }),
        contactEmail: z
          .string({
            invalid_type_error: 'Contact email must be a string',
            required_error: 'Contact email is required',
          })
          .optional(),
        contactName: z
          .string({
            invalid_type_error: 'Contact name must be a string',
            required_error: 'Contact name is required',
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.clients.findUnique({
        where: { clientName: input.clientName },
      });

      if (client) throw new Error('Client already exists');

      const newClient = await ctx.prisma.clients.create({
        data: {
          clientName: input.clientName,
          color: input.color,
          contact: { email: input.contactEmail, name: input.contactName },
          v: 0,
        },
      });

      return newClient;
    }),
  getOne: protectedProcedure()
    .input(
      z.object({
        clientId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const client = await ctx.prisma.clients.findUnique({
        where: { id: input.clientId },
      });

      if (!client) throw new TRPCError({ code: 'NOT_FOUND' });

      return client;
    }),
});
