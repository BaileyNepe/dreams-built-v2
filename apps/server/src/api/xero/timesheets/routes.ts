import { prisma } from '@config/db';
import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { shortDateString } from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { logError } from '@utils/logger';
import { withXero, getConnection } from 'libs/xero/tokens';
import { z } from 'zod';
import { getEarningsRatesList, getPayRunCalendarsList, getXeroEmployees } from '../payroll/service';
import {
  addDays,
  DAY_OFFSETS,
  getCalendarBlocker,
  getWeekUserHours,
  type WeekUserHours
} from './service';

type ExportRow = {
  id: string;
  status: 'PUSHED' | 'APPROVED' | 'REVERSED' | 'FAILED';
  xeroTimesheetId: string;
  totalUnits: number;
  error: string;
  updatedAt: Date;
};

const isBlockingExport = (existing: ExportRow | undefined) =>
  existing && (existing.status === 'PUSHED' || existing.status === 'APPROVED');

const buildWeekContext = async (weekStart: string) => {
  const [userHours, employees, calendars, exports] = await Promise.all([
    getWeekUserHours(weekStart),
    getXeroEmployees(),
    getPayRunCalendarsList(),
    prisma.xeroTimesheetExport.findMany({
      where: { weekStart },
      select: {
        id: true,
        userId: true,
        status: true,
        xeroTimesheetId: true,
        totalUnits: true,
        error: true,
        updatedAt: true
      }
    })
  ]);

  const employeesById = new Map(employees.map((e) => [e.xeroEmployeeId, e]));
  const calendarsById = new Map(calendars.map((c) => [c.payrollCalendarId, c]));
  const exportsByUserId = new Map(exports.map((e) => [e.userId, e]));

  const resolveUser = (user: WeekUserHours) => {
    const blockers: string[] = [];
    const existingExport = exportsByUserId.get(user.userId);

    if (isBlockingExport(existingExport)) {
      blockers.push('This week has already been exported for this user');
    }

    const employee = user.xeroEmployeeId
      ? employeesById.get(user.xeroEmployeeId)
      : undefined;

    if (!user.xeroEmployeeId) {
      blockers.push('User is not linked to a Xero employee');
    } else if (!employee) {
      blockers.push('The linked Xero employee no longer exists in Xero');
    }

    const calendar = employee?.payrollCalendarId
      ? calendarsById.get(employee.payrollCalendarId)
      : undefined;

    if (employee) {
      const calendarBlocker = getCalendarBlocker(calendar, weekStart);
      if (calendarBlocker) blockers.push(calendarBlocker);
    }

    return { user, employee, calendar, existingExport, blockers };
  };

  return { userHours, resolveUser };
};

export const xeroTimesheetsRouter = trpc.router({
  previewExport: protectedProcedure([authz.payroll_manage])
    .input(z.object({ weekStart: shortDateString }))
    .query(async ({ input }) => {
      const [{ userHours, resolveUser }, earningsRates, connection] = await Promise.all([
        buildWeekContext(input.weekStart),
        getEarningsRatesList(),
        getConnection()
      ]);

      return {
        rows: userHours.map((user) => {
          const { employee, calendar, existingExport, blockers } = resolveUser(user);

          return {
            userId: user.userId,
            userName: user.userName,
            xeroEmployeeId: user.xeroEmployeeId,
            xeroEmployeeName: employee
              ? `${employee.firstName} ${employee.lastName}`.trim()
              : null,
            hoursByDay: user.hoursByDay,
            totalHours: user.totalHours,
            calendar: calendar
              ? { id: calendar.payrollCalendarId, name: calendar.name }
              : null,
            existingExport: existingExport ?? null,
            blockers
          };
        }),
        earningsRates,
        defaultEarningsRateId: connection?.defaultEarningsRateId ?? ''
      };
    }),

  push: protectedProcedure([authz.payroll_manage])
    .input(
      z.object({
        weekStart: shortDateString,
        userIds: z.array(z.string()).min(1),
        earningsRateId: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connection = await getConnection();
      const earningsRateId = input.earningsRateId || connection?.defaultEarningsRateId;

      if (!earningsRateId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'No earnings rate selected and no default is set. Choose one in Settings → Xero.'
        });
      }

      const { userHours, resolveUser } = await buildWeekContext(input.weekStart);
      const userHoursById = new Map(userHours.map((user) => [user.userId, user]));

      const results: {
        userId: string;
        userName: string;
        ok: boolean;
        xeroTimesheetId?: string;
        error?: string;
      }[] = [];

      const periodStart = input.weekStart;
      const periodEnd = addDays(input.weekStart, 6);

      const pushUser = async (userId: string) => {
        const user = userHoursById.get(userId);

        if (!user) {
          results.push({
            userId,
            userName: userId,
            ok: false,
            error: 'No timesheet hours found for this user in that week'
          });
          return;
        }

        const { employee, calendar, existingExport, blockers } = resolveUser(user);

        if (blockers.length > 0 || !employee || !calendar) {
          results.push({
            userId,
            userName: user.userName,
            ok: false,
            error: blockers.join('; ') || 'User cannot be exported'
          });
          return;
        }

        const lines = Object.entries(user.hoursByDay).map(([dayName, hours]) => ({
          date: addDays(input.weekStart, DAY_OFFSETS[dayName.toLowerCase()] ?? 0),
          earningsRateID: earningsRateId,
          numberOfUnits: hours
        }));

        try {
          const xeroTimesheetId = await withXero(async (xero, tenantId) => {
            const created = await xero.payrollNZApi.createTimesheet(tenantId, {
              payrollCalendarID: calendar.payrollCalendarId,
              employeeID: employee.xeroEmployeeId,
              startDate: periodStart,
              endDate: periodEnd,
              timesheetLines: lines
            });

            return created.body.timesheet?.timesheetID ?? '';
          });

          const exportData = {
            xeroTimesheetId,
            payrollCalendarId: calendar.payrollCalendarId,
            periodStartDate: periodStart,
            periodEndDate: periodEnd,
            status: 'PUSHED' as const,
            totalUnits: user.totalHours,
            lines,
            error: '',
            exportedById: ctx.user.id
          };

          // FAILED/REVERSED rows occupy the (userId, weekStart) slot and are
          // safe to overwrite; PUSHED/APPROVED were rejected as blockers above.
          if (existingExport) {
            await prisma.xeroTimesheetExport.update({
              where: { id: existingExport.id },
              data: exportData
            });
          } else {
            await prisma.xeroTimesheetExport.create({
              data: { userId, weekStart: input.weekStart, ...exportData }
            });
          }

          results.push({ userId, userName: user.userName, ok: true, xeroTimesheetId });
        } catch (error) {
          const message =
            error instanceof TRPCError
              ? error.message
              : 'Pushing the timesheet to Xero failed';

          logError({ message: 'Xero timesheet push failed', error, details: { userId } });

          try {
            await prisma.xeroTimesheetExport.upsert({
              where: { userId_weekStart: { userId, weekStart: input.weekStart } },
              create: {
                userId,
                weekStart: input.weekStart,
                payrollCalendarId: calendar.payrollCalendarId,
                periodStartDate: periodStart,
                periodEndDate: periodEnd,
                status: 'FAILED',
                totalUnits: user.totalHours,
                lines,
                error: message,
                exportedById: ctx.user.id
              },
              update: { status: 'FAILED', error: message, lines }
            });
          } catch (persistError) {
            logError({
              message: 'Failed to record Xero timesheet export failure',
              error: persistError
            });
          }

          results.push({ userId, userName: user.userName, ok: false, error: message });
        }
      };

      for (const userId of input.userIds) {
        await pushUser(userId);
      }

      return { results };
    }),

  approve: protectedProcedure([authz.payroll_manage])
    .input(z.object({ exportId: z.string() }))
    .mutation(async ({ input }) => {
      const exportRow = await prisma.xeroTimesheetExport.findUnique({
        where: { id: input.exportId }
      });

      if (!exportRow || !exportRow.xeroTimesheetId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export not found' });
      }

      if (exportRow.status !== 'PUSHED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Only pushed timesheets can be approved (status: ${exportRow.status})`
        });
      }

      await withXero(async (xero, tenantId) => {
        await xero.payrollNZApi.approveTimesheet(tenantId, exportRow.xeroTimesheetId);
      });

      await prisma.xeroTimesheetExport.update({
        where: { id: exportRow.id },
        data: { status: 'APPROVED' }
      });

      return true;
    }),

  revert: protectedProcedure([authz.payroll_manage])
    .input(z.object({ exportId: z.string() }))
    .mutation(async ({ input }) => {
      const exportRow = await prisma.xeroTimesheetExport.findUnique({
        where: { id: input.exportId }
      });

      if (!exportRow || !exportRow.xeroTimesheetId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Export not found' });
      }

      if (exportRow.status !== 'PUSHED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            exportRow.status === 'APPROVED'
              ? 'Approved timesheets must be reverted in Xero first'
              : `Only pushed timesheets can be reverted (status: ${exportRow.status})`
        });
      }

      await withXero(async (xero, tenantId) => {
        await xero.payrollNZApi.deleteTimesheet(tenantId, exportRow.xeroTimesheetId);
      });

      await prisma.xeroTimesheetExport.update({
        where: { id: exportRow.id },
        data: { status: 'REVERSED' }
      });

      return true;
    }),

  listExports: protectedProcedure([authz.payroll_manage])
    .input(z.object({ weekStart: shortDateString }))
    .query(async ({ input }) => ({
      exports: await prisma.xeroTimesheetExport.findMany({
        where: { weekStart: input.weekStart },
        include: {
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { updatedAt: 'desc' }
      })
    }))
});
