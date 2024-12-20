import { trpc } from '@config/trpc';
import { clientRouter } from './client/routes';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  user: userRouter,
  client: clientRouter
});

export type ApiRouter = typeof apiRouter;
