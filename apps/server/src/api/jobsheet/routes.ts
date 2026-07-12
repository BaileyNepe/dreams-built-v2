import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  createJobSheetSnapshotInputSchema,
  jobSheetRulesSchema,
  saveJobSheetInputSchema
} from '@dreams-built/shared/src/jobsheet/types';
import { z } from 'zod';
import {
  createSheet,
  createSnapshot,
  getSheetByProject,
  getSnapshot,
  listSnapshots,
  refreshSheetRules,
  removeSheet,
  restoreSnapshot,
  saveSheet,
  snapshotIfChanged,
  updateSheetRules
} from './service';

export const jobSheetsRouter = trpc.router({
  // The project's sheet, or null when none has been created yet.
  getByProject: protectedProcedure([authz.jobs_read])
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => getSheetByProject(ctx.db, input.projectId)),

  create: protectedProcedure([authz.jobs_edit])
    .input(
      z.object({
        projectId: z.string(),
        wallCount: z.number().int().min(0).max(50).default(0)
      })
    )
    .mutation(({ ctx, input }) => createSheet(ctx.db, input.projectId, input.wallCount)),

  // Autosave endpoint: optimistic-lock save of the whole document.
  save: protectedProcedure([authz.jobs_edit])
    .input(saveJobSheetInputSchema)
    .mutation(({ ctx, input }) => saveSheet(ctx.db, input)),

  // Reset this sheet's rules back to the shared defaults.
  refreshRules: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string() }))
    .mutation(({ ctx, input }) => refreshSheetRules(ctx.db, input.sheetId)),

  // Edit THIS sheet's rules only — the shared defaults are never touched.
  updateSheetRules: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string(), data: jobSheetRulesSchema }))
    .mutation(({ ctx, input }) => updateSheetRules(ctx.db, input)),

  remove: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string() }))
    .mutation(({ ctx, input }) => removeSheet(ctx.db, input.sheetId)),

  createSnapshot: protectedProcedure([authz.jobs_edit])
    .input(createJobSheetSnapshotInputSchema)
    .mutation(({ ctx, input }) =>
      createSnapshot(ctx.db, { ...input, userId: ctx.user.id })
    ),

  // Print/export safety net: snapshot only when content actually changed.
  snapshotIfChanged: protectedProcedure([authz.jobs_edit])
    .input(createJobSheetSnapshotInputSchema)
    .mutation(({ ctx, input }) =>
      snapshotIfChanged(ctx.db, { ...input, userId: ctx.user.id })
    ),

  listSnapshots: protectedProcedure([authz.jobs_read])
    .input(z.object({ sheetId: z.string() }))
    .query(({ ctx, input }) => listSnapshots(ctx.db, input.sheetId)),

  getSnapshot: protectedProcedure([authz.jobs_read])
    .input(z.object({ snapshotId: z.string() }))
    .query(({ ctx, input }) => getSnapshot(ctx.db, input.snapshotId)),

  restoreSnapshot: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string(), snapshotId: z.string() }))
    .mutation(({ ctx, input }) =>
      restoreSnapshot(ctx.db, { ...input, userId: ctx.user.id })
    )
});
