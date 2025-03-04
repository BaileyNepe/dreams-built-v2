import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const timesheetRouter = trpc.router({
  get: protectedProcedure([authz.timesheet])
    .input(
      z.object({
        userId: z.string().cuid(),
        weekStart: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if the user is trying to view another user's timesheet
      // Note: they must have the required permissions to view other users timesheets
      if (
        input.userId !== ctx.user.id &&
        !ctx.user.permissions.includes(authz.timesheet_view_all)
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not allowed to view other users timesheets'
        });
      }

      const userId = input.userId ?? ctx.user.id;

      const entries = await ctx.db.timeEntry.findMany({
        select: {
          id: true,
          day: true,
          weekStart: true,
          projectId: true,
          startTime: true,
          endTime: true
        },
        where: {
          deleted: false,
          userId,
          weekStart: input.weekStart
        }
      });

      const notes = await ctx.db.note.findMany({
        select: {
          day: true,
          message: true
        },
        where: {
          userId,
          weekStart: input.weekStart
        }
      });

      return {
        entries,
        notes
      };
    }),
  update: protectedProcedure([authz.timesheet])
    .input(
      z.object({
        userId: z.string().cuid(),
        weekStart: z.string(),
        entries: z.array(
          z.object({
            id: z.string().cuid(),
            day: z.string().regex(/^\d{2}$/),
            duration: z.number(),
            projectId: z.string().cuid(),
            startTime: z.string().regex(/^\d{2}:\d{2}$/),
            endTime: z.string().regex(/^\d{2}:\d{2}$/)
          })
        ),
        notes: z.array(
          z.object({
            day: z.string().regex(/^\d{2}$/),
            message: z.string().max(255)
          })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.userId !== ctx.user.id &&
        !ctx.user.permissions.includes(authz.timesheet_view_all)
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not allowed to view other users timesheets'
        });
      }

      const { userId } = input;
      // create a transaction to delete all entries and notes for the week and then insert the new ones
      await ctx.db.$transaction([
        ctx.db.timeEntry.deleteMany({
          where: {
            userId,
            weekStart: input.weekStart
          }
        }),
        ctx.db.note.deleteMany({
          where: {
            userId,
            weekStart: input.weekStart
          }
        }),
        ctx.db.timeEntry.createMany({
          data: input.entries.map((entry) => ({
            userId,
            weekStart: input.weekStart,
            ...entry
          }))
        }),
        ctx.db.note.createMany({
          data: input.notes.map((note) => ({
            userId,
            weekStart: input.weekStart,
            ...note
          }))
        })
      ]);

      return true;
    })
});
