import { createTRPCRouter } from '@/server/api/trpc';
import { timesheetRouter } from './routers/timesheet';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  timesheet: timesheetRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
