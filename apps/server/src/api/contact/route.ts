import { protectedProcedure, publicProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { ContactSchema } from '@dreams-built/shared/src/schemas';
import { type Prisma } from '@prisma/client';
import { logInfo } from '@utils/logger';
import { z } from 'zod';

export const contactRouter = trpc.router({
  contact: publicProcedure.input(ContactSchema).mutation(async ({ input, ctx }) => {
    const { name, email, phoneNumber, message } = input;

    logInfo({
      message: 'Contact form submission',
      details: { name, email, phoneNumber, message, ctx: ctx.req.ip }
    });

    await ctx.db.contact.create({
      data: {
        name,
        email,
        phone: phoneNumber,
        message,
        isRead: false // New messages are unread by default
      }
    });

    return {
      success: true,
      message: 'Contact form submitted successfully'
    };
  }),

  list: protectedProcedure([authz.messages_read])
    .input(
      z.object({
        page: z.number().default(1),
        perPage: z.number().default(10),
        query: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, query } = input;

      const where: Prisma.ContactWhereInput = query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { message: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } }
            ]
          }
        : {};

      const [messages, total] = await Promise.all([
        ctx.db.contact.findMany({
          where,
          orderBy: {
            createdAt: 'desc'
          },
          skip: (page - 1) * perPage,
          take: perPage,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            message: true,
            createdAt: true,
            isRead: true // Include read status
          }
        }),
        ctx.db.contact.count({ where })
      ]);

      return {
        messages,
        total
      };
    }),

  countUnread: protectedProcedure([authz.messages_read]).query(async ({ ctx }) => {
    const count = await ctx.db.contact.count({
      where: {
        isRead: false,
        deleted: false
      }
    });

    return { count };
  }),

  markAsRead: protectedProcedure([authz.messages_read])
    .input(
      z.object({
        id: z.string(),
        isRead: z.boolean().default(true)
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.contact.update({
        where: {
          id: input.id
        },
        data: {
          isRead: input.isRead
        }
      });

      return { success: true };
    }),

  markAllAsRead: protectedProcedure([authz.messages_read]).mutation(async ({ ctx }) => {
    await ctx.db.contact.updateMany({
      where: {
        isRead: false,
        deleted: false
      },
      data: {
        isRead: true
      }
    });

    return { success: true };
  })
});
