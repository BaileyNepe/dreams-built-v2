import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  createScheduleSchema,
  dateRegex,
  updateScheduleSchema
} from '@dreams-built/shared/src/schemas';
import { z } from 'zod';

export const scheduleRouter = trpc.router({
  blockDay: protectedProcedure([authz.schedule_edit])
    .input(
      z.object({
        date: z.string().regex(dateRegex),
        details: z.string().optional(),
        deleted: z.boolean().optional()
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.blockedDate.upsert({
        where: {
          date: input.date
        },
        create: {
          date: input.date,
          details: input.details
        },
        update: {
          details: input.details,
          deleted: input.deleted ?? false
        }
      })
    ),
  projectParts: protectedProcedure([authz.schedule_read]).query(async ({ ctx }) =>
    ctx.db.projectPart.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        order: 'asc'
      }
    })
  ),
  get: protectedProcedure([authz.schedule_read])
    .input(
      z.object({
        startRange: z.string().regex(dateRegex),
        endRange: z.string().regex(dateRegex)
      })
    )
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.db.projectPart.findMany({
        select: {
          id: true,
          name: true,
          projectSchedule: {
            select: {
              id: true,
              notes: true,
              startDate: true,
              endDate: true,
              project: {
                select: {
                  id: true,
                  client: {
                    select: {
                      name: true
                    }
                  },
                  jobNumber: true,
                  color: true,
                  address: true,
                  endClient: true
                }
              }
            },
            where: {
              deleted: false,
              startDate: {
                lte: new Date(input.endRange)
              },
              endDate: {
                gte: new Date(input.startRange)
              }
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });

      const blockedDays = await ctx.db.blockedDate.findMany({
        select: {
          date: true,
          details: true
        },
        where: {
          date: {
            gte: input.startRange,
            lte: input.endRange
          },
          deleted: false
        }
      });

      return {
        schedule,
        blockedDays
      };
    }),
  add: protectedProcedure([authz.schedule_edit])
    .input(createScheduleSchema)
    .mutation(async ({ ctx, input }) =>
      ctx.db.projectSchedule.create({
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          projectPartId: input.projectPartId,
          projectId: input.projectId,
          notes: input.notes
        }
      })
    ),
  update: protectedProcedure([authz.schedule_edit])
    .input(updateScheduleSchema)
    .mutation(async ({ ctx, input }) =>
      ctx.db.projectSchedule.update({
        where: {
          id: input.id
        },
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          deleted: input.deleted,
          notes: input.notes
        }
      })
    )
});
