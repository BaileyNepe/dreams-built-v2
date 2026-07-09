import { XERO_CACHE_TTL, xeroCached } from 'libs/xero/cache';
import { withXero } from 'libs/xero/tokens';
import { CalendarType } from 'xero-node/dist/gen/model/payroll-nz/calendarType';

export type XeroEmployeeSummary = {
  xeroEmployeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  payrollCalendarId: string | null;
  jobTitle: string;
  startDate: string | null;
  endDate: string | null;
};

export const getXeroEmployees = async (): Promise<XeroEmployeeSummary[]> =>
  xeroCached('payroll:employees', XERO_CACHE_TTL.short, async () =>
    withXero(async (xero, tenantId) => {
      const employees: XeroEmployeeSummary[] = [];
      let page = 1;

      for (;;) {
        const result = await xero.payrollNZApi.getEmployees(tenantId, undefined, page);

        for (const employee of result.body.employees ?? []) {
          employees.push({
            xeroEmployeeId: employee.employeeID ?? '',
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email ?? '',
            payrollCalendarId: employee.payrollCalendarID ?? null,
            jobTitle: employee.jobTitle ?? '',
            startDate: employee.startDate ?? null,
            endDate: employee.endDate ?? null
          });
        }

        const pageCount = result.body.pagination?.pageCount ?? 1;
        if (page >= pageCount) break;
        page += 1;
      }

      return employees;
    })
  );

export const getLeaveBalancesForEmployee = async (xeroEmployeeId: string) =>
  xeroCached(
    `payroll:leave:${xeroEmployeeId}`,
    XERO_CACHE_TTL.short,
    async () =>
      withXero(async (xero, tenantId) => {
        const result = await xero.payrollNZApi.getEmployeeLeaveBalances(
          tenantId,
          xeroEmployeeId
        );

        return (result.body.leaveBalances ?? []).map((balance) => ({
          name: balance.name ?? '',
          leaveTypeId: balance.leaveTypeID ?? '',
          balance: balance.balance ?? 0,
          typeOfUnits: balance.typeOfUnits ?? ''
        }));
      })
  );

export const getPayRunsPage = async (page: number) =>
  xeroCached(`payroll:payruns:${page}`, XERO_CACHE_TTL.short, async () =>
    withXero(async (xero, tenantId) => {
      const result = await xero.payrollNZApi.getPayRuns(tenantId, page);

      const payRuns = (result.body.payRuns ?? []).map((payRun) => ({
        payRunId: payRun.payRunID ?? '',
        payrollCalendarId: payRun.payrollCalendarID ?? '',
        periodStartDate: payRun.periodStartDate ?? '',
        periodEndDate: payRun.periodEndDate ?? '',
        paymentDate: payRun.paymentDate ?? '',
        status: String(payRun.payRunStatus ?? ''),
        calendarType: String(payRun.calendarType ?? ''),
        totalCost: payRun.totalCost ?? null,
        totalPay: payRun.totalPay ?? null
      }));

      return {
        payRuns: payRuns.sort((a, b) => b.periodStartDate.localeCompare(a.periodStartDate)),
        pageCount: result.body.pagination?.pageCount ?? 1
      };
    })
  );

const mapPayslip = (paySlip: {
  paySlipID?: string;
  employeeID?: string;
  firstName?: string;
  lastName?: string;
  grossEarnings?: number;
  totalEarnings?: number;
  totalEmployeeTaxes?: number;
  totalDeductions?: number;
  totalPay?: number;
}) => ({
  payslipId: paySlip.paySlipID ?? '',
  xeroEmployeeId: paySlip.employeeID ?? '',
  employeeName: `${paySlip.firstName ?? ''} ${paySlip.lastName ?? ''}`.trim(),
  grossEarnings: paySlip.grossEarnings ?? paySlip.totalEarnings ?? 0,
  totalTax: paySlip.totalEmployeeTaxes ?? 0,
  totalDeductions: paySlip.totalDeductions ?? 0,
  takeHomePay: paySlip.totalPay ?? 0
});

export type PayslipSummary = ReturnType<typeof mapPayslip>;

export const getPayslipsForPayRun = async (payRunId: string, isPosted: boolean) =>
  xeroCached(
    `payroll:payslips:${payRunId}`,
    // Posted pay runs are immutable, so cache them for longer.
    isPosted ? XERO_CACHE_TTL.long : XERO_CACHE_TTL.short,
    async () =>
      withXero(async (xero, tenantId) => {
        const result = await xero.payrollNZApi.getPaySlips(tenantId, payRunId);

        return (result.body.paySlips ?? []).map(mapPayslip);
      })
  );

export const getEarningsRatesList = async () =>
  xeroCached('payroll:earningsRates', XERO_CACHE_TTL.long, async () =>
    withXero(async (xero, tenantId) => {
      const result = await xero.payrollNZApi.getEarningsRates(tenantId);

      return (result.body.earningsRates ?? []).map((rate) => ({
        id: rate.earningsRateID ?? '',
        name: rate.name,
        earningsType: String(rate.earningsType ?? ''),
        typeOfUnits: rate.typeOfUnits
      }));
    })
  );

export const getPayRunCalendarsList = async () =>
  xeroCached('payroll:calendars', XERO_CACHE_TTL.short, async () =>
    withXero(async (xero, tenantId) => {
      const result = await xero.payrollNZApi.getPayRunCalendars(tenantId);

      return (result.body.payRunCalendars ?? []).map((calendar) => ({
        payrollCalendarId: calendar.payrollCalendarID ?? '',
        name: calendar.name,
        calendarType: calendar.calendarType,
        isWeekly: calendar.calendarType === CalendarType.Weekly,
        periodStartDate: calendar.periodStartDate,
        periodEndDate: calendar.periodEndDate ?? null,
        paymentDate: calendar.paymentDate
      }));
    })
  );
