import { TRPCError } from '@trpc/server'
import { authz } from 'utils/auth/permissions'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const getTimesheet = protectedProcedure(
  [authz.timesheet, authz.timesheet_view_all],
  {
    requireAllPermissions: false,
  },
)
  .input(
    z.object({
      userId: z.string().cuid().optional(),
      weekStart: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    // Check if the user is trying to view another user's timesheet
    // Note: they must have the required permissions to view other users timesheets
    if (
      input.userId &&
      input.userId !== ctx.user.id &&
      !ctx.userPermissions.includes(authz.timesheet_view_all)
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not allowed to view other users timesheets',
      })
    }

    const userId = input.userId ?? ctx.user.id

    const entries = await ctx.db.timeEntry.findMany({
      select: {
        id: true,
        day: true,
        weekStart: true,
        projectId: true,
        startTime: true,
        endTime: true,
      },
      where: {
        deleted: false,
        userId,
        weekStart: input.weekStart,
      },
    })

    const notes = await ctx.db.note.findMany({
      select: {
        day: true,
        message: true,
      },
      where: {
        userId,
        weekStart: input.weekStart,
      },
    })

    return {
      entries,
      notes,
    }
  })

export const timesheetRouter = createTRPCRouter({
  get: getTimesheet,
})
