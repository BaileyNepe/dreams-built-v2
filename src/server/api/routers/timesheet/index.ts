import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const timesheetRouter = createTRPCRouter({
  getWeek: publicProcedure
    .input(
      z.object({
        weekStart: z.string(),
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: user RBAC to check if user can access this timesheet

      const user = await ctx.prisma.users.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        return {
          errors: [{ message: 'User does not exist' }],
        };
      }

      // find all timesheetEntries with userId and weekStart
      const timeSheetEntries = await ctx.prisma.timesheetentries.findMany({
        where: {
          userId: input.userId,
          weekStart: input.weekStart,
        },
        include: {
          jobObject: true,
          userObject: true,
        },
      });

      // find all comments with userId and weekStart
      const comments = await ctx.prisma.timesheetcomments.findMany({
        where: {
          userObject: {
            userId: input.userId,
          },
          weekStart: input.weekStart,
        },
      });

      return {
        data: {
          timeSheetEntries,
          comments,
        },
      };
    }),
});
