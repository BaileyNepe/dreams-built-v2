import { trpc } from '@config/trpc';
import { clientRouter } from './client/routes';
import { projectsRouter } from './project/routes';
import { timesheetRouter } from './timesheet/routes';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  users: userRouter,
  clients: clientRouter,
  projects: projectsRouter,
  timesheet: timesheetRouter
});

export type ApiRouter = typeof apiRouter;
