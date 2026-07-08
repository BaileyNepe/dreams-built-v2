import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { updateJobSheetRulesInputSchema } from '@dreams-built/shared/src/jobsheet/types';
import { getActiveRules, updateRules } from './service';

export const jobSheetRulesRouter = trpc.router({
  // The single active rule set, lazily created from defaults on first read.
  getActive: protectedProcedure([authz.jobs_read]).query(({ ctx }) =>
    getActiveRules(ctx.db)
  ),

  update: protectedProcedure([authz.jobs_edit])
    .input(updateJobSheetRulesInputSchema)
    .mutation(({ ctx, input }) => updateRules(ctx.db, input))
});
