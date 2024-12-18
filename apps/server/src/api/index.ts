import { trpc } from '@config/trpc';

export const apiRouter = trpc.router({});

export type ApiRouter = typeof apiRouter;
