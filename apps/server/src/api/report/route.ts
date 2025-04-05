import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { shortDateString } from '@dreams-built/shared/src/schemas';
import { z } from 'zod';

export const reportsRouter = trpc.router({
  getTimesheets: protectedProcedure([authz.timesheet_view_all])
    .input(
      z.object({
        week: shortDateString
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.timeEntry.findMany({
        where: {
          weekStart: input.week,
          deleted: false
        },
        select: {
          id: true,
          day: true,
          duration: true,
          startTime: true,
          endTime: true,

          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hourlyRate: true
            }
          },
          project: {
            select: {
              id: true,
              jobNumber: true,
              address: true,
              client: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      const flattenedEntries = entries.map((entry) => ({
        id: entry.id,
        userId: entry.user.id,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        jobNumber: entry.project.jobNumber,
        userName: `${entry.user.firstName} ${entry.user.lastName}`.trim(),
        hourlyRate: entry.user.hourlyRate,
        projectId: entry.project.id,
        projectAddress: entry.project.address,
        clientId: entry.project.client.id,
        clientName: entry.project.client.name
      }));

      const notes = await ctx.db.note.findMany({
        where: {
          weekStart: input.week
        },
        select: {
          id: true,
          day: true,
          userId: true,
          message: true
        }
      });

      const usersWithNoEntries = await ctx.db.user.findMany({
        where: {
          role: 'EMPLOYEE',
          note: { none: { weekStart: input.week } },
          timeEntry: { none: { weekStart: input.week } }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      return {
        entries: flattenedEntries,
        notes,
        usersWithNoEntries
      };
    })
});
