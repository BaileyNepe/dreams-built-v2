/**
 * Job sheet persistence logic, separated from the tRPC routing layer so it
 * can be unit-tested with a mocked Prisma client.
 *
 * Concurrency model: `JobSheet.revision` is an optimistic lock. Every write
 * that changes sheet content bumps it; `saveSheet` only applies when the
 * caller's revision matches (atomically via updateMany), otherwise the
 * caller gets a CONFLICT and must reload.
 */

import { DEFAULT_JOBSHEET_RULES } from '@dreams-built/shared/src/jobsheet/defaults';
import { computeJobSheet } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import {
  jobSheetDataSchema,
  jobSheetRulesSchema,
  migrateJobSheetData,
  snapshotBlobSchema,
  type JobSheetData
} from '@dreams-built/shared/src/jobsheet/types';
import { type Prisma, type PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

/** The subset of PrismaClient the service uses ($transaction included). */
export type Db = PrismaClient;

const notFound = (what: string) =>
  new TRPCError({ code: 'NOT_FOUND', message: `${what} not found` });

const asJson = (value: unknown) => value as Prisma.InputJsonValue;

/* ------------------------------------------------------------------ */
/* Rules                                                                */
/* ------------------------------------------------------------------ */

/**
 * The single active rule set, lazily created from the shared defaults on
 * first access (there is no production seed script in this repo).
 */
export const getActiveRules = async (db: Db) => {
  const existing = await db.jobSheetRules.findFirst({
    where: { isActive: true, deleted: false },
    orderBy: { createdAt: 'asc' }
  });
  if (existing) return existing;
  return db.jobSheetRules.create({
    data: { name: 'Default', data: asJson(DEFAULT_JOBSHEET_RULES), isActive: true }
  });
};

export const updateRules = async (
  db: Db,
  input: { id: string; name?: string; data: unknown }
) => {
  const data = jobSheetRulesSchema.parse(input.data);
  const existing = await db.jobSheetRules.findFirst({
    where: { id: input.id, deleted: false }
  });
  if (!existing) throw notFound('Rule set');
  return db.jobSheetRules.update({
    where: { id: input.id },
    data: { data: asJson(data), ...(input.name !== undefined && { name: input.name }) }
  });
};

/* ------------------------------------------------------------------ */
/* Sheets                                                               */
/* ------------------------------------------------------------------ */

const getSheetOrThrow = async (db: Db, sheetId: string) => {
  const sheet = await db.jobSheet.findFirst({
    where: { id: sheetId, deleted: false }
  });
  if (!sheet) throw notFound('Job sheet');
  return sheet;
};

export const getSheetByProject = async (db: Db, projectId: string) =>
  db.jobSheet.findFirst({ where: { projectId, deleted: false } });

/**
 * Create the project's sheet with a copy of the active rules. Idempotent:
 * an existing live sheet is returned as-is; a soft-deleted one is reset in
 * place (projectId is unique, so re-inserting would violate the index).
 */
export const createSheet = async (db: Db, projectId: string, wallCount = 0) => {
  const project = await db.project.findFirst({
    where: { id: projectId, deleted: false }
  });
  if (!project) throw notFound('Project');

  const activeRules = await getActiveRules(db);
  const emptyData: JobSheetData = jobSheetDataSchema.parse({
    walls: Array.from({ length: wallCount }, () => ({
      id: crypto.randomUUID(),
      lengthMm: 0
    }))
  });

  const existing = await db.jobSheet.findUnique({ where: { projectId } });
  if (existing && !existing.deleted) return existing;
  if (existing) {
    return db.jobSheet.update({
      where: { projectId },
      data: {
        deleted: false,
        data: asJson(emptyData),
        rules: activeRules.data as Prisma.InputJsonValue,
        revision: existing.revision + 1
      }
    });
  }
  return db.jobSheet.create({
    data: {
      projectId,
      data: asJson(emptyData),
      rules: activeRules.data as Prisma.InputJsonValue
    }
  });
};

export const saveSheet = async (
  db: Db,
  input: { sheetId: string; revision: number; data: unknown }
) => {
  const data = jobSheetDataSchema.parse(input.data);

  // Atomic compare-and-swap on the revision.
  const result = await db.jobSheet.updateMany({
    where: { id: input.sheetId, revision: input.revision, deleted: false },
    data: { data: asJson(data), revision: input.revision + 1 }
  });

  if (result.count === 0) {
    await getSheetOrThrow(db, input.sheetId); // NOT_FOUND when it doesn't exist
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Job sheet was changed elsewhere — reload to continue editing.'
    });
  }
  return { revision: input.revision + 1 };
};

/** Re-copy the shared default rules onto the sheet (explicit user action). */
export const refreshSheetRules = async (db: Db, sheetId: string) => {
  const sheet = await getSheetOrThrow(db, sheetId);
  const activeRules = await getActiveRules(db);
  return db.jobSheet.update({
    where: { id: sheet.id },
    data: {
      rules: activeRules.data as Prisma.InputJsonValue,
      revision: sheet.revision + 1
    }
  });
};

/**
 * Edit THIS sheet's rules only. The shared defaults stay untouched — most
 * jobs use them, but some differ, and one job's tweak must never leak into
 * everyone else's new sheets.
 */
export const updateSheetRules = async (
  db: Db,
  input: { sheetId: string; data: unknown }
) => {
  const rules = jobSheetRulesSchema.parse(input.data);
  const sheet = await getSheetOrThrow(db, input.sheetId);
  return db.jobSheet.update({
    where: { id: sheet.id },
    data: { rules: asJson(rules), revision: sheet.revision + 1 }
  });
};

export const removeSheet = async (db: Db, sheetId: string) => {
  const sheet = await getSheetOrThrow(db, sheetId);
  return db.jobSheet.update({ where: { id: sheet.id }, data: { deleted: true } });
};

/* ------------------------------------------------------------------ */
/* Snapshots                                                            */
/* ------------------------------------------------------------------ */

const buildBlob = (sheet: { data: unknown; rules: unknown }) => {
  const data = migrateJobSheetData(jobSheetDataSchema.parse(sheet.data));
  const rules = jobSheetRulesSchema.parse(sheet.rules);
  return { data, rules, computed: computeJobSheet(data, rules) };
};

const nextVersion = async (
  tx: Prisma.TransactionClient,
  jobSheetId: string
): Promise<number> => {
  const max = await tx.jobSheetSnapshot.aggregate({
    where: { jobSheetId },
    _max: { version: true }
  });
  // eslint-disable-next-line no-underscore-dangle
  return (max._max.version ?? 0) + 1;
};

export const createSnapshot = async (
  db: Db,
  input: { sheetId: string; label?: string; userId: string }
) => {
  const sheet = await getSheetOrThrow(db, input.sheetId);
  const blob = buildBlob(sheet);

  return db.$transaction(async (tx) => {
    const version = await nextVersion(tx, sheet.id);
    return tx.jobSheetSnapshot.create({
      data: {
        jobSheetId: sheet.id,
        version,
        label: input.label ?? '',
        blob: asJson(blob),
        createdById: input.userId
      }
    });
  });
};

export const listSnapshots = async (db: Db, sheetId: string) => {
  await getSheetOrThrow(db, sheetId);
  return db.jobSheetSnapshot.findMany({
    where: { jobSheetId: sheetId, deleted: false },
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      label: true,
      createdAt: true,
      createdBy: { select: { firstName: true, lastName: true } }
    }
  });
};

export const getSnapshot = async (db: Db, snapshotId: string) => {
  const snapshot = await db.jobSheetSnapshot.findFirst({
    where: { id: snapshotId, deleted: false },
    include: { createdBy: { select: { firstName: true, lastName: true } } }
  });
  if (!snapshot) throw notFound('Snapshot');
  return snapshot;
};

/**
 * Restore a snapshot into the live sheet. The current state is snapshotted
 * first (labelled "Before restore vN") inside the same transaction, so a
 * restore never loses work.
 */
export const restoreSnapshot = async (
  db: Db,
  input: { sheetId: string; snapshotId: string; userId: string }
) => {
  const sheet = await getSheetOrThrow(db, input.sheetId);
  const snapshot = await db.jobSheetSnapshot.findFirst({
    where: { id: input.snapshotId, jobSheetId: sheet.id, deleted: false }
  });
  if (!snapshot) throw notFound('Snapshot');

  const restored = snapshotBlobSchema.parse(snapshot.blob);
  const backupBlob = buildBlob(sheet);

  return db.$transaction(async (tx) => {
    const version = await nextVersion(tx, sheet.id);
    await tx.jobSheetSnapshot.create({
      data: {
        jobSheetId: sheet.id,
        version,
        label: `Before restore v${snapshot.version}`,
        blob: asJson(backupBlob),
        createdById: input.userId
      }
    });
    return tx.jobSheet.update({
      where: { id: sheet.id },
      data: {
        data: asJson(restored.data),
        rules: asJson(restored.rules),
        revision: sheet.revision + 1
      }
    });
  });
};

/**
 * Snapshot the sheet only when its content differs from the latest
 * snapshot. Called when the sheet leaves the app (print, PDF export) so
 * there is always a record of exactly what was issued, without flooding
 * the history with identical versions.
 */
export const snapshotIfChanged = async (
  db: Db,
  input: { sheetId: string; label?: string; userId: string }
) => {
  const sheet = await getSheetOrThrow(db, input.sheetId);
  const latest = await db.jobSheetSnapshot.findFirst({
    where: { jobSheetId: sheet.id, deleted: false },
    orderBy: { version: 'desc' },
    select: { version: true, blob: true }
  });

  // Both sides come back from jsonb (normalized key order), so plain
  // stringify equality is stable.
  const latestData = latest ? (latest.blob as { data?: unknown }).data : undefined;
  if (latest && JSON.stringify(latestData) === JSON.stringify(sheet.data)) {
    return { created: false as const, version: latest.version };
  }

  const snapshot = await createSnapshot(db, input);
  return { created: true as const, version: snapshot.version };
};
