import { trpc } from '@config/trpc';
import { clientRouter } from './client/routes';
import { contactRouter } from './contact/route';
import { forumRouter } from './forum/routes';
import { projectFilesRouter } from './project/file-routes';
import { projectsRouter } from './project/routes';
import { reportsRouter } from './report/route';
import { scheduleRouter } from './schedule/routes';
import { timesheetRouter } from './timesheet/routes';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  users: userRouter,
  clients: clientRouter,
  projects: projectsRouter,
  projectFiles: projectFilesRouter,
  timesheet: timesheetRouter,
  schedule: scheduleRouter,
  reports: reportsRouter,
  contact: contactRouter,
  forum: forumRouter
});

export type ApiRouter = typeof apiRouter;
