import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  rawTimeSchema,
  shortDateString,
  validateTimeRange
} from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const timesheetRouter = trpc.router({
  get: protectedProcedure([authz.timesheet])
    .input(
      z.object({
        userId: z.string().cuid(),
        weekStart: shortDateString
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
  updateById: protectedProcedure([authz.timesheet_view_all, authz.timesheet])
    .input(
      z
        .object({
          id: z.string().cuid2(),
          userId: z.string().cuid2(),
          projectId: z.string().cuid2(),
          deleted: z.boolean().optional()
        })
        .merge(rawTimeSchema)
        .superRefine(validateTimeRange)
    )
    .mutation(async ({ ctx, input }) => {
      const { id, userId, ...data } = input;

      await ctx.db.timeEntry.update({
        where: {
          id
        },
        data: {
          ...data,
          deleted: input.deleted ?? false,
          userId
        }
      });

      return true;
    }),

  update: protectedProcedure([authz.timesheet])
    .input(
      z.object({
        userId: z.string().cuid2(),
        weekStart: shortDateString,
        entries: z.array(
          z
            .object({
              id: z.string().cuid2(),
              day: z.string(),

              projectId: z.string().cuid2()
            })
            .merge(rawTimeSchema)
            .superRefine(validateTimeRange)
        ),
        notes: z.array(
          z.object({
            day: z.string(),
            message: z.string().max(2000)
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
