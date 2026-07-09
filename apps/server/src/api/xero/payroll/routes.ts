import { cache } from '@config/cache';
import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { TRPCError } from '@trpc/server';
import { getConnection, withXero } from 'libs/xero/tokens';
import { z } from 'zod';
import {
  getEarningsRatesList,
  getLeaveBalancesForEmployee,
  getPayRunsPage,
  getPayslipsForPayRun,
  getXeroEmployees,
  type PayslipSummary
} from './service';

const unlinkedResult = { unlinked: true as const };

export const xeroPayrollRouter = trpc.router({
  listEmployees: protectedProcedure([authz.payroll_view_all]).query(async ({ ctx }) => {
    const xeroEmployees = await getXeroEmployees();

    const users = await ctx.db.user.findMany({
      where: { deleted: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        xeroEmployeeId: true
      }
    });

    const usersByXeroId = new Map(
      users.filter((user) => user.xeroEmployeeId).map((user) => [user.xeroEmployeeId, user])
    );
    const linkedUserIds = new Set(
      users.filter((user) => user.xeroEmployeeId).map((user) => user.id)
    );
    const usersByEmail = new Map(
      users
        .filter((user) => user.email && !user.xeroEmployeeId)
        .map((user) => [user.email.toLowerCase(), user])
    );

    return {
      employees: xeroEmployees.map((employee) => {
        const linkedUser = usersByXeroId.get(employee.xeroEmployeeId);
        const suggestedUser = linkedUser
          ? null
          : usersByEmail.get(employee.email.toLowerCase()) ?? null;

        return {
          ...employee,
          linkedUserId: linkedUser?.id ?? null,
          linkedUserName: linkedUser
            ? `${linkedUser.firstName} ${linkedUser.lastName}`.trim()
            : null,
          suggestedUserId: suggestedUser?.id ?? null,
          suggestedUserName: suggestedUser
            ? `${suggestedUser.firstName} ${suggestedUser.lastName}`.trim()
            : null
        };
      }),
      users: users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        linked: linkedUserIds.has(user.id) && Boolean(user.xeroEmployeeId)
      }))
    };
  }),

  linkEmployee: protectedProcedure([authz.xero_manage])
    .input(z.object({ userId: z.string(), xeroEmployeeId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      if (input.xeroEmployeeId) {
        const alreadyLinked = await ctx.db.user.findUnique({
          where: { xeroEmployeeId: input.xeroEmployeeId },
          select: { id: true, firstName: true, lastName: true }
        });

        if (alreadyLinked && alreadyLinked.id !== input.userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `That Xero employee is already linked to ${alreadyLinked.firstName} ${alreadyLinked.lastName}`.trim()
          });
        }
      }

      const user = await ctx.db.user.update({
        where: { id: input.userId },
        data: { xeroEmployeeId: input.xeroEmployeeId },
        select: { authId: true }
      });

      // ctx.user is cached by authId; drop it so the link is visible immediately.
      await cache().user.delete(user.authId);

      return true;
    }),

  getLeaveBalances: protectedProcedure([authz.payroll_view_all])
    .input(z.object({ xeroEmployeeId: z.string() }))
    .query(async ({ input }) => ({
      balances: await getLeaveBalancesForEmployee(input.xeroEmployeeId)
    })),

  listPayRuns: protectedProcedure([authz.payroll_view_all])
    .input(z.object({ page: z.number().int().positive().default(1) }).optional())
    .query(async ({ input }) => getPayRunsPage(input?.page ?? 1)),

  getPayRun: protectedProcedure([authz.payroll_view_all])
    .input(z.object({ payRunId: z.string() }))
    .query(async ({ input }) => {
      const { payRuns } = await getPayRunsPage(1);
      let payRun = payRuns.find((run) => run.payRunId === input.payRunId) ?? null;

      if (!payRun) {
        payRun = await withXero(async (xero, tenantId) => {
          const result = await xero.payrollNZApi.getPayRun(tenantId, input.payRunId);
          const run = result.body.payRun;

          if (!run) return null;

          return {
            payRunId: run.payRunID ?? '',
            payrollCalendarId: run.payrollCalendarID ?? '',
            periodStartDate: run.periodStartDate ?? '',
            periodEndDate: run.periodEndDate ?? '',
            paymentDate: run.paymentDate ?? '',
            status: String(run.payRunStatus ?? ''),
            calendarType: String(run.calendarType ?? ''),
            totalCost: run.totalCost ?? null,
            totalPay: run.totalPay ?? null
          };
        });
      }

      if (!payRun) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Pay run not found' });
      }

      const payslips = await getPayslipsForPayRun(
        input.payRunId,
        payRun.status === 'Posted'
      );

      return { payRun, payslips };
    }),

  getPayslip: protectedProcedure([authz.payroll_view_self])
    .input(z.object({ payslipId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payslip = await withXero(async (xero, tenantId) => {
        const result = await xero.payrollNZApi.getPaySlip(tenantId, input.payslipId);

        return result.body.paySlip ?? null;
      });

      if (!payslip) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Payslip not found' });
      }

      const canViewAll = ctx.user.permissions.includes(authz.payroll_view_all);
      const isOwn =
        Boolean(ctx.user.xeroEmployeeId) && payslip.employeeID === ctx.user.xeroEmployeeId;

      if (!canViewAll && !isOwn) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own payslips'
        });
      }

      return {
        payslipId: payslip.paySlipID ?? '',
        xeroEmployeeId: payslip.employeeID ?? '',
        employeeName: `${payslip.firstName ?? ''} ${payslip.lastName ?? ''}`.trim(),
        grossEarnings: payslip.grossEarnings ?? 0,
        totalTax: payslip.totalEmployeeTaxes ?? 0,
        totalDeductions: payslip.totalDeductions ?? 0,
        totalReimbursements: payslip.totalReimbursements ?? 0,
        totalSuperannuation: payslip.totalSuperannuation ?? 0,
        takeHomePay: payslip.totalPay ?? 0,
        earningsLines: (payslip.earningsLines ?? []).map((line) => ({
          displayName: line.displayName ?? '',
          ratePerUnit: line.ratePerUnit ?? null,
          numberOfUnits: line.numberOfUnits ?? null,
          fixedAmount: line.fixedAmount ?? null,
          amount: line.amount ?? null
        })),
        leaveEarningsLines: (payslip.leaveEarningsLines ?? []).map((line) => ({
          displayName: line.displayName ?? '',
          ratePerUnit: line.ratePerUnit ?? null,
          numberOfUnits: line.numberOfUnits ?? null,
          amount: line.amount ?? null
        }))
      };
    }),

  getMyPayslips: protectedProcedure([authz.payroll_view_self])
    .input(z.object({ limit: z.number().int().positive().max(24).default(6) }).optional())
    .query(async ({ ctx, input }) => {
      const {xeroEmployeeId} = ctx.user;

      if (!xeroEmployeeId) {
        return { ...unlinkedResult, payslips: [] as (PayslipSummary & {
          payRunId: string;
          periodStartDate: string;
          periodEndDate: string;
          paymentDate: string;
        })[] };
      }

      const limit = input?.limit ?? 6;
      const payslips: (PayslipSummary & {
        payRunId: string;
        periodStartDate: string;
        periodEndDate: string;
        paymentDate: string;
      })[] = [];

      let page = 1;
      let pageCount = 1;

      // Payroll NZ has no payslips-by-employee endpoint, so walk recent pay
      // runs (posted only — drafts aren't final) and filter. Per-run payslip
      // lists are cached, which keeps this within rate limits.
      while (payslips.length < limit && page <= pageCount && page <= 4) {
        const result = await getPayRunsPage(page);
        pageCount = result.pageCount;

        for (const payRun of result.payRuns) {
          if (payRun.status === 'Posted') {
            const runPayslips = await getPayslipsForPayRun(payRun.payRunId, true);
            const own = runPayslips.find(
              (slip) => slip.xeroEmployeeId === xeroEmployeeId
            );

            if (own) {
              payslips.push({
                ...own,
                payRunId: payRun.payRunId,
                periodStartDate: payRun.periodStartDate,
                periodEndDate: payRun.periodEndDate,
                paymentDate: payRun.paymentDate
              });
            }
          }

          if (payslips.length >= limit) break;
        }

        page += 1;
      }

      return { unlinked: false as const, payslips };
    }),

  getMyLeaveBalances: protectedProcedure([authz.payroll_view_self]).query(
    async ({ ctx }) => {
      if (!ctx.user.xeroEmployeeId) {
        return { ...unlinkedResult, balances: [] };
      }

      return {
        unlinked: false as const,
        balances: await getLeaveBalancesForEmployee(ctx.user.xeroEmployeeId)
      };
    }
  ),

  getEarningsRates: protectedProcedure([authz.payroll_view_all]).query(async () => {
    const [earningsRates, connection] = await Promise.all([
      getEarningsRatesList(),
      getConnection()
    ]);

    return {
      earningsRates,
      defaultEarningsRateId: connection?.defaultEarningsRateId ?? ''
    };
  })
});
