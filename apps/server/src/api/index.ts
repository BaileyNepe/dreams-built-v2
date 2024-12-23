import { trpc } from '@config/trpc';
import { clientRouter } from './client/routes';
import { projectsRouter } from './project/routes';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  user: userRouter,
  clients: clientRouter,
  project: projectsRouter
});

export type ApiRouter = typeof apiRouter;
