import { trpc } from '@config/trpc';
import { clientRouter } from './client/routes';
import { projectsRouter } from './project/routes';
import { reportsRouter } from './report/route';
import { scheduleRouter } from './schedule/routes';
import { timesheetRouter } from './timesheet/routes';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  users: userRouter,
  clients: clientRouter,
  projects: projectsRouter,
  timesheet: timesheetRouter,
  schedule: scheduleRouter,
  reports: reportsRouter
});

export type ApiRouter = typeof apiRouter;
