import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { dateRegex } from '@dreams-built/shared/src/schemas';
import { z } from 'zod';

export const reportsRouter = trpc.router({
  getTimesheets: protectedProcedure([authz.timesheet_view_all])
    .input(
      z.object({
        startRange: z.string().regex(dateRegex),
        endRange: z.string().regex(dateRegex)
      })
    )
    .query(async ({ ctx }) => {})
});
