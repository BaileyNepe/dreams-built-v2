import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import {
  createJobSheetSnapshotInputSchema,
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
  saveSheet
} from './service';

export const jobSheetsRouter = trpc.router({
  // The project's sheet, or null when none has been created yet.
  getByProject: protectedProcedure([authz.jobs_read])
    .input(z.object({ projectId: z.string() }))
    .query(({ ctx, input }) => getSheetByProject(ctx.db, input.projectId)),

  create: protectedProcedure([authz.jobs_edit])
    .input(z.object({ projectId: z.string() }))
    .mutation(({ ctx, input }) => createSheet(ctx.db, input.projectId)),

  // Autosave endpoint: optimistic-lock save of the whole document.
  save: protectedProcedure([authz.jobs_edit])
    .input(saveJobSheetInputSchema)
    .mutation(({ ctx, input }) => saveSheet(ctx.db, input)),

  // Copy the current active global rules onto this sheet.
  refreshRules: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string() }))
    .mutation(({ ctx, input }) => refreshSheetRules(ctx.db, input.sheetId)),

  remove: protectedProcedure([authz.jobs_edit])
    .input(z.object({ sheetId: z.string() }))
    .mutation(({ ctx, input }) => removeSheet(ctx.db, input.sheetId)),

  createSnapshot: protectedProcedure([authz.jobs_edit])
    .input(createJobSheetSnapshotInputSchema)
    .mutation(({ ctx, input }) =>
      createSnapshot(ctx.db, { ...input, userId: ctx.user.id })
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
