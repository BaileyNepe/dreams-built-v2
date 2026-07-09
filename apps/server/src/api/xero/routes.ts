import { trpc } from '@config/trpc';
import { connectionRouter } from './connection/routes';
import { xeroPayrollRouter } from './payroll/routes';
import { xeroProjectsRouter } from './projects/routes';
import { xeroTimesheetsRouter } from './timesheets/routes';

export const xeroRouter = trpc.router({
  connection: connectionRouter,
  projects: xeroProjectsRouter,
  payroll: xeroPayrollRouter,
  timesheets: xeroTimesheetsRouter
});
