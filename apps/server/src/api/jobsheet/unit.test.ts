/**
 * Unit tests for the job sheet service layer (TEST_TYPE=unit — no DB, no
 * auth stack). The Prisma client is a hand-rolled mock; what's under test
 * is the service logic: lazy rule creation, sheet lifecycle, the
 * optimistic-lock save, and snapshot versioning/restore.
 */

import { DEFAULT_JOBSHEET_RULES } from '@dreams-built/shared/src/jobsheet/defaults';
import { jobSheetDataSchema } from '@dreams-built/shared/src/jobsheet/types';
import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createSheet,
  createSnapshot,
  getActiveRules,
  removeSheet,
  restoreSnapshot,
  saveSheet,
  snapshotIfChanged,
  updateRules,
  updateSheetRules,
  type Db
} from './service';

const createMockDb = () => {
  const db = {
    jobSheetRules: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    jobSheet: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    },
    jobSheetSnapshot: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn()
    },
    project: {
      findFirst: vi.fn()
    },
    $transaction: vi.fn()
  };
  // Transactions run the callback against the same mock client.
  db.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(db));
  return db;
};

type MockDb = ReturnType<typeof createMockDb>;
const asDb = (db: MockDb) => db as unknown as Db;

const emptyData = jobSheetDataSchema.parse({});

const liveSheet = {
  id: 'sheet1',
  projectId: 'proj1',
  data: emptyData,
  rules: DEFAULT_JOBSHEET_RULES,
  revision: 3,
  deleted: false
};

const expectCode = async (action: () => Promise<unknown>, code: string) => {
  try {
    await action();
    throw new Error(`expected TRPCError ${code}, but the action succeeded`);
  } catch (error) {
    if (!(error instanceof TRPCError)) throw error;
    expect(error.code).toBe(code);
  }
};

describe('getActiveRules', () => {
  it('returns the existing active row without creating', async () => {
    const db = createMockDb();
    const row = { id: 'r1', data: DEFAULT_JOBSHEET_RULES, isActive: true };
    db.jobSheetRules.findFirst.mockResolvedValue(row);

    expect(await getActiveRules(asDb(db))).toBe(row);
    expect(db.jobSheetRules.create).not.toHaveBeenCalled();
  });

  it('lazily creates the default rule set when none exists', async () => {
    const db = createMockDb();
    db.jobSheetRules.findFirst.mockResolvedValue(null);
    db.jobSheetRules.create.mockImplementation(async ({ data }: never) => ({
      id: 'r1',
      ...(data as object)
    }));

    const created = await getActiveRules(asDb(db));
    expect(db.jobSheetRules.create).toHaveBeenCalledWith({
      data: { name: 'Default', data: DEFAULT_JOBSHEET_RULES, isActive: true }
    });
    expect(created.id).toBe('r1');
  });
});

describe('updateRules', () => {
  it('rejects a rule payload that fails the shared schema', async () => {
    const db = createMockDb();
    await expect(
      updateRules(asDb(db), {
        id: 'r1',
        data: { ...DEFAULT_JOBSHEET_RULES, standardSizesMm: [] }
      })
    ).rejects.toThrow();
    expect(db.jobSheetRules.update).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND for a missing rule set', async () => {
    const db = createMockDb();
    db.jobSheetRules.findFirst.mockResolvedValue(null);
    await expectCode(
      () => updateRules(asDb(db), { id: 'nope', data: DEFAULT_JOBSHEET_RULES }),
      'NOT_FOUND'
    );
  });
});

describe('createSheet', () => {
  it('throws NOT_FOUND when the project does not exist', async () => {
    const db = createMockDb();
    db.project.findFirst.mockResolvedValue(null);
    await expectCode(() => createSheet(asDb(db), 'nope'), 'NOT_FOUND');
  });

  it('copies the active rules onto a brand-new sheet', async () => {
    const db = createMockDb();
    db.project.findFirst.mockResolvedValue({ id: 'proj1' });
    db.jobSheetRules.findFirst.mockResolvedValue({
      id: 'r1',
      data: DEFAULT_JOBSHEET_RULES
    });
    db.jobSheet.findUnique.mockResolvedValue(null);
    db.jobSheet.create.mockImplementation(async ({ data }: never) => data);

    await createSheet(asDb(db), 'proj1');
    expect(db.jobSheet.create).toHaveBeenCalledWith({
      data: { projectId: 'proj1', data: emptyData, rules: DEFAULT_JOBSHEET_RULES }
    });
  });

  it('returns an existing live sheet untouched (idempotent)', async () => {
    const db = createMockDb();
    db.project.findFirst.mockResolvedValue({ id: 'proj1' });
    db.jobSheetRules.findFirst.mockResolvedValue({ id: 'r1', data: DEFAULT_JOBSHEET_RULES });
    db.jobSheet.findUnique.mockResolvedValue(liveSheet);

    expect(await createSheet(asDb(db), 'proj1')).toBe(liveSheet);
    expect(db.jobSheet.create).not.toHaveBeenCalled();
    expect(db.jobSheet.update).not.toHaveBeenCalled();
  });

  it('resets a soft-deleted sheet in place (projectId is unique)', async () => {
    const db = createMockDb();
    db.project.findFirst.mockResolvedValue({ id: 'proj1' });
    db.jobSheetRules.findFirst.mockResolvedValue({ id: 'r1', data: DEFAULT_JOBSHEET_RULES });
    db.jobSheet.findUnique.mockResolvedValue({ ...liveSheet, deleted: true });
    db.jobSheet.update.mockImplementation(async (args: never) => args);

    await createSheet(asDb(db), 'proj1');
    expect(db.jobSheet.create).not.toHaveBeenCalled();
    expect(db.jobSheet.update).toHaveBeenCalledWith({
      where: { projectId: 'proj1' },
      data: {
        deleted: false,
        data: emptyData,
        rules: DEFAULT_JOBSHEET_RULES,
        revision: liveSheet.revision + 1
      }
    });
  });
});

describe('saveSheet', () => {
  it('applies atomically and returns the bumped revision', async () => {
    const db = createMockDb();
    db.jobSheet.updateMany.mockResolvedValue({ count: 1 });

    const result = await saveSheet(asDb(db), {
      sheetId: 'sheet1',
      revision: 3,
      data: emptyData
    });
    expect(result).toEqual({ revision: 4 });
    expect(db.jobSheet.updateMany).toHaveBeenCalledWith({
      where: { id: 'sheet1', revision: 3, deleted: false },
      data: { data: emptyData, revision: 4 }
    });
  });

  it('throws CONFLICT when the revision is stale', async () => {
    const db = createMockDb();
    db.jobSheet.updateMany.mockResolvedValue({ count: 0 });
    db.jobSheet.findFirst.mockResolvedValue(liveSheet); // sheet exists

    await expectCode(
      () => saveSheet(asDb(db), { sheetId: 'sheet1', revision: 2, data: emptyData }),
      'CONFLICT'
    );
  });

  it('throws NOT_FOUND when the sheet does not exist', async () => {
    const db = createMockDb();
    db.jobSheet.updateMany.mockResolvedValue({ count: 0 });
    db.jobSheet.findFirst.mockResolvedValue(null);

    await expectCode(
      () => saveSheet(asDb(db), { sheetId: 'nope', revision: 0, data: emptyData }),
      'NOT_FOUND'
    );
  });

  it('rejects malformed sheet data before touching the DB', async () => {
    const db = createMockDb();
    await expect(
      saveSheet(asDb(db), {
        sheetId: 'sheet1',
        revision: 0,
        data: { walls: [{ id: 'w1', lengthMm: -5 }] }
      })
    ).rejects.toThrow();
    expect(db.jobSheet.updateMany).not.toHaveBeenCalled();
  });
});

describe('removeSheet', () => {
  it('soft deletes', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheet.update.mockImplementation(async (args: never) => args);

    await removeSheet(asDb(db), 'sheet1');
    expect(db.jobSheet.update).toHaveBeenCalledWith({
      where: { id: 'sheet1' },
      data: { deleted: true }
    });
  });
});

describe('createSnapshot', () => {
  it('increments the version and embeds data, rules and computed output', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.aggregate.mockResolvedValue({ _max: { version: 4 } });
    db.jobSheetSnapshot.create.mockImplementation(async ({ data }: never) => data);

    const created = (await createSnapshot(asDb(db), {
      sheetId: 'sheet1',
      label: 'before pour',
      userId: 'user1'
    })) as unknown as { version: number; blob: { computed: { perimeterMm: number } } };

    expect(created.version).toBe(5);
    expect(created).toMatchObject({
      jobSheetId: 'sheet1',
      label: 'before pour',
      createdById: 'user1'
    });
    expect(created.blob).toMatchObject({
      data: emptyData,
      rules: DEFAULT_JOBSHEET_RULES
    });
    expect(created.blob.computed.perimeterMm).toBe(0);
  });

  it('starts at version 1 for the first snapshot', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.aggregate.mockResolvedValue({ _max: { version: null } });
    db.jobSheetSnapshot.create.mockImplementation(async ({ data }: never) => data);

    const created = (await createSnapshot(asDb(db), {
      sheetId: 'sheet1',
      userId: 'user1'
    })) as { version: number; label: string };
    expect(created.version).toBe(1);
    expect(created.label).toBe('');
  });
});

describe('restoreSnapshot', () => {
  const snapshotBlob = {
    data: { ...emptyData, notes: 'the old state' },
    rules: DEFAULT_JOBSHEET_RULES,
    computed: undefined
  };

  it('throws NOT_FOUND when the snapshot belongs to another sheet', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.findFirst.mockResolvedValue(null);

    await expectCode(
      () =>
        restoreSnapshot(asDb(db), {
          sheetId: 'sheet1',
          snapshotId: 'other',
          userId: 'user1'
        }),
      'NOT_FOUND'
    );
  });

  it('backs up the current state, then restores data and rules with a revision bump', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.findFirst.mockResolvedValue({
      id: 'snap2',
      jobSheetId: 'sheet1',
      version: 2,
      blob: snapshotBlob
    });
    db.jobSheetSnapshot.aggregate.mockResolvedValue({ _max: { version: 6 } });
    db.jobSheetSnapshot.create.mockImplementation(async ({ data }: never) => data);
    db.jobSheet.update.mockImplementation(async (args: never) => args);

    await restoreSnapshot(asDb(db), {
      sheetId: 'sheet1',
      snapshotId: 'snap2',
      userId: 'user1'
    });

    // Safety snapshot of the pre-restore state, versioned above the max.
    expect(db.jobSheetSnapshot.create).toHaveBeenCalledTimes(1);
    const backup = db.jobSheetSnapshot.create.mock.calls[0][0].data;
    expect(backup.version).toBe(7);
    expect(backup.label).toBe('Before restore v2');
    expect(backup.blob.data).toEqual(emptyData);

    // The live sheet now carries the snapshot's data + rules.
    expect(db.jobSheet.update).toHaveBeenCalledWith({
      where: { id: 'sheet1' },
      data: {
        data: snapshotBlob.data,
        rules: snapshotBlob.rules,
        revision: liveSheet.revision + 1
      }
    });
  });
});

describe('updateSheetRules', () => {
  it('rejects a rules payload that fails the shared schema', async () => {
    const db = createMockDb();
    await expect(
      updateSheetRules(asDb(db), {
        sheetId: 'sheet1',
        data: { ...DEFAULT_JOBSHEET_RULES, standardSizesMm: [] }
      })
    ).rejects.toThrow();
    expect(db.jobSheet.update).not.toHaveBeenCalled();
  });

  it('writes this sheet\'s rules only and bumps the revision', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheet.update.mockImplementation(async (args: never) => args);

    await updateSheetRules(asDb(db), {
      sheetId: 'sheet1',
      data: { ...DEFAULT_JOBSHEET_RULES, shutterThicknessMm: 90 }
    });
    expect(db.jobSheet.update).toHaveBeenCalledWith({
      where: { id: 'sheet1' },
      data: {
        rules: { ...DEFAULT_JOBSHEET_RULES, shutterThicknessMm: 90 },
        revision: liveSheet.revision + 1
      }
    });
    // The shared default rule set is never written by a sheet-level edit.
    expect(db.jobSheetRules.update).not.toHaveBeenCalled();
  });
});

describe('snapshotIfChanged', () => {
  const editedData = { ...emptyData, notes: 'changed' };

  it('skips when the latest snapshot already has the current data', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.findFirst.mockResolvedValue({
      version: 4,
      blob: { data: emptyData, rules: DEFAULT_JOBSHEET_RULES, computed: {} }
    });

    const result = await snapshotIfChanged(asDb(db), {
      sheetId: 'sheet1',
      label: 'Printed',
      userId: 'user1'
    });
    expect(result).toEqual({ created: false, version: 4 });
    expect(db.jobSheetSnapshot.create).not.toHaveBeenCalled();
  });

  it('creates a snapshot when the content moved since the last one', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue({ ...liveSheet, data: editedData });
    db.jobSheetSnapshot.findFirst.mockResolvedValue({
      version: 4,
      blob: { data: emptyData, rules: DEFAULT_JOBSHEET_RULES, computed: {} }
    });
    db.jobSheetSnapshot.aggregate.mockResolvedValue({ _max: { version: 4 } });
    db.jobSheetSnapshot.create.mockImplementation(async ({ data }: never) => data);

    const result = await snapshotIfChanged(asDb(db), {
      sheetId: 'sheet1',
      label: 'Printed',
      userId: 'user1'
    });
    expect(result).toEqual({ created: true, version: 5 });
    const created = db.jobSheetSnapshot.create.mock.calls[0][0].data;
    expect(created.label).toBe('Printed');
    expect(created.createdById).toBe('user1');
    expect(created.blob.data).toEqual(editedData);
  });

  it('creates the first snapshot when none exists yet', async () => {
    const db = createMockDb();
    db.jobSheet.findFirst.mockResolvedValue(liveSheet);
    db.jobSheetSnapshot.findFirst.mockResolvedValue(null);
    db.jobSheetSnapshot.aggregate.mockResolvedValue({ _max: { version: null } });
    db.jobSheetSnapshot.create.mockImplementation(async ({ data }: never) => data);

    const result = await snapshotIfChanged(asDb(db), {
      sheetId: 'sheet1',
      label: 'PDF export',
      userId: 'user1'
    });
    expect(result).toEqual({ created: true, version: 1 });
  });
});
