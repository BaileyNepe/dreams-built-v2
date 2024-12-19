import { trpc } from '@config/trpc';
import { userRouter } from './user/routes';

export const apiRouter = trpc.router({
  user: userRouter
});

export type ApiRouter = typeof apiRouter;
