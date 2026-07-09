/**
 * Tests for the engine features layered on top of the prototype port:
 * BLK insets, manual override layering, cut formatting, and snapshot diffs.
 */

import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import { nineWarrenLaneData } from '../fixtures/nineWarrenLane';
import type { Cut, SnapshotBlob, Wall } from '../types';
import { computeJobSheet, computeWall } from './computeSheet';
import { diffSheets } from './diff';
import { formatCut, formatCuts, formatRebateRuns } from './format';

const rules = DEFAULT_JOBSHEET_RULES;

const baseWall: Wall = {
  id: 'w1',
  lengthMm: 3000,
  cornerStart: 'external',
  cornerEnd: 'external',
  absorbShutterAtStart: false,
  absorbShutterAtEnd: false,
  hasRebate: true,
  rebateOffsetAtStart: false,
  rebateOffsetAtEnd: false,
  rebateExtendAtStart: false,
  rebateExtendAtEnd: false,
  overhangCapAtEnd: false,
  blkAtStart: false,
  blkAtEnd: false,
  openings: [],
  rebateInsets: [],
  manualRuns: [],
  polystyreneOverride: null,
  angledCornerDeg: null,
  isGarageDoorWall: false,
  notes: '',
  override: null
};

describe('BLK insets', () => {
  it('emits a BLK marker piece at the flagged end of the shutter run', () => {
    const w = computeWall({ ...baseWall, blkAtEnd: true }, 0, rules);
    expect(w.shutters.cuts.map((c) => c.kind)).toEqual(['standard', 'blk']);
    expect(w.shutters.cuts[1].lengthMm).toBe(rules.blkLengthMm);
  });

  it('emits BLK at both ends when both flags are set', () => {
    const w = computeWall({ ...baseWall, blkAtStart: true, blkAtEnd: true }, 0, rules);
    expect(w.shutters.cuts.map((c) => c.kind)).toEqual(['blk', 'standard', 'blk']);
  });

  it('tallies BLK pieces under the blk key, not shorts', () => {
    const sheet = computeJobSheet(
      { ...nineWarrenLaneData, walls: [{ ...baseWall, blkAtEnd: true }] },
      rules
    );
    expect(sheet.tallies.shutters.blk).toBe(1);
    expect(sheet.tallies.shutters.shorts).toBe(0);
  });
});

describe('manual override layering', () => {
  const overriddenWall: Wall = {
    ...baseWall,
    lengthMm: 3380,
    override: {
      shutterCuts: [
        { kind: 'standard', lengthMm: 3000, polystyrene: false },
        { kind: 'short', lengthMm: 380, polystyrene: true }
      ],
      rebateRuns: [[{ kind: 'standard', lengthMm: 3000, polystyrene: false }]],
      note: 'QS wants the short padded here'
    }
  };

  it('uses the override cuts verbatim instead of recomputing', () => {
    const w = computeWall(overriddenWall, 0, rules);
    expect(w.isOverridden).toBe(true);
    // Without the override, 3380 with external end would promote to [3600].
    expect(w.shutters.cuts.map((c) => c.lengthMm)).toEqual([3000, 380]);
    expect(w.rebate).toHaveLength(1);
    expect(w.rebate[0].cuts[0].lengthMm).toBe(3000);
  });

  it('survives input changes that would otherwise recompute (measurement edit)', () => {
    const w = computeWall({ ...overriddenWall, lengthMm: 9999 }, 0, rules);
    expect(w.shutters.cuts.map((c) => c.lengthMm)).toEqual([3000, 380]);
  });

  it('feeds overridden cuts into the tallies', () => {
    const sheet = computeJobSheet(
      { ...nineWarrenLaneData, walls: [overriddenWall] },
      rules
    );
    expect(sheet.tallies.shutters['3000']).toBe(1);
    expect(sheet.tallies.shutters.shorts).toBe(1);
    expect(sheet.tallies.rebate['3000']).toBe(1);
  });

  it('recomputes normally once the override is cleared', () => {
    const w = computeWall({ ...overriddenWall, override: null }, 0, rules);
    expect(w.isOverridden).toBe(false);
    expect(w.shutters.cuts.map((c) => c.lengthMm)).toEqual([3600]);
  });
});

describe('formatCut / formatCuts / formatRebateRuns', () => {
  it('formats the trade notation', () => {
    const cuts: Cut[] = [
      { kind: 'standard', lengthMm: 4800, polystyrene: false },
      { kind: 'short', lengthMm: 355, polystyrene: true },
      { kind: 'blk', lengthMm: 120, polystyrene: false },
      { kind: 'short', lengthMm: 420, polystyrene: false, angleDeg: 45 }
    ];
    expect(cuts.map(formatCut)).toEqual(['4800', '355p', 'BLK', '420 @45°']);
    expect(formatCuts(cuts)).toBe('4800 355p BLK 420 @45°');
  });

  it('renders an empty rebate as "-" and joins segments with a pipe', () => {
    expect(formatRebateRuns([])).toBe('-');
    expect(
      formatRebateRuns([
        {
          effectiveLengthMm: 785,
          cuts: [
            { kind: 'standard', lengthMm: 600, polystyrene: false },
            { kind: 'short', lengthMm: 185, polystyrene: false }
          ],
          overhangMm: 0
        },
        {
          effectiveLengthMm: 600,
          cuts: [{ kind: 'standard', lengthMm: 600, polystyrene: false }],
          overhangMm: 0
        }
      ])
    ).toBe('600 185 | 600');
  });
});

describe('diffSheets', () => {
  const blobOf = (data: typeof nineWarrenLaneData): SnapshotBlob => ({
    data,
    rules,
    computed: undefined
  });

  it('reports an empty diff for identical blobs', () => {
    const diff = diffSheets(blobOf(nineWarrenLaneData), blobOf(nineWarrenLaneData));
    expect(diff.isEmpty).toBe(true);
    expect(diff.walls).toEqual([]);
  });

  it('reports a changed wall with old and new breakdowns and tally deltas', () => {
    const after = {
      ...nineWarrenLaneData,
      walls: nineWarrenLaneData.walls.map((w) =>
        w.id === 'w03' ? { ...w, lengthMm: 2660 } : w
      )
    };
    const diff = diffSheets(blobOf(nineWarrenLaneData), blobOf(after));
    expect(diff.isEmpty).toBe(false);
    expect(diff.walls).toHaveLength(1);
    expect(diff.walls[0]).toMatchObject({
      id: 'w03',
      status: 'changed',
      before: { shutters: '1800 260' },
      after: { shutters: '2400 260' }
    });
    expect(diff.walls[0].changedFields).toContain('measurement');
    // 2060 -> 2660: shutter 1800 becomes 2400; rebate 1800 becomes 2400 too.
    expect(diff.tallies.shutters).toEqual({ 2400: 1, 1800: -1 });
    expect(diff.tallies.rebate).toEqual({ 2400: 1, 1800: -1 });
  });

  it('reports added and removed walls', () => {
    const after = {
      ...nineWarrenLaneData,
      walls: [
        ...nineWarrenLaneData.walls.filter((w) => w.id !== 'w14'),
        { ...baseWall, id: 'w99', lengthMm: 1200 }
      ]
    };
    const diff = diffSheets(blobOf(nineWarrenLaneData), blobOf(after));
    const byId = Object.fromEntries(diff.walls.map((w) => [w.id, w.status]));
    expect(byId.w14).toBe('removed');
    expect(byId.w99).toBe('added');
  });

  it('reports a pure reorder as position changes, not add/remove', () => {
    const walls = [...nineWarrenLaneData.walls];
    const [first] = walls.splice(0, 1);
    walls.push(first);
    const diff = diffSheets(
      blobOf(nineWarrenLaneData),
      blobOf({ ...nineWarrenLaneData, walls })
    );
    expect(diff.walls.every((w) => w.status === 'changed')).toBe(true);
    expect(diff.walls.every((w) => w.changedFields.includes('position'))).toBe(true);
    expect(diff.tallies.shutters).toEqual({});
  });

  it('diffs section items by id with labels', () => {
    const after = {
      ...nineWarrenLaneData,
      joinery: [
        { id: 'j01', text: 'Garage Door 4850mm', qty: 2 },
        { id: 'j02', text: 'Entry door', qty: null }
      ],
      showerBoxes: nineWarrenLaneData.showerBoxes.filter((i) => i.id !== 's02'),
      garage: nineWarrenLaneData.garage
    };
    const diff = diffSheets(blobOf(nineWarrenLaneData), blobOf(after));
    expect(diff.items.joinery.added).toEqual(['Entry door']);
    expect(diff.items.joinery.changed).toEqual([
      'Garage Door 4850mm ×1 → Garage Door 4850mm ×2'
    ]);
    expect(diff.items.showerBoxes.removed).toEqual(['Main bathroom 900mm ×1']);
  });

  it('reflects rule changes between snapshots (same data, different rules)', () => {
    const after: SnapshotBlob = {
      data: nineWarrenLaneData,
      rules: { ...rules, shutterThicknessMm: 100 },
      computed: undefined
    };
    // Wall 13 absorbs at the end: 1620 - 100 = 1520 -> short becomes 320p.
    const diff = diffSheets(blobOf(nineWarrenLaneData), after);
    const w13 = diff.walls.find((w) => w.id === 'w13');
    expect(w13?.after?.shutters).toBe('1200 320p');
  });
});

describe('partial-rebate wall (Bailey wall-5 diagram)', () => {
  // 6000 wall: brick 1800 | bare 2400 (BLK caps) | brick 1800; the previous
  // wall carries rebate across the external start corner.
  const prev: Wall = { ...baseWall, id: 'w4', lengthMm: 2400 };
  const wall5: Wall = {
    ...baseWall,
    id: 'w5',
    lengthMm: 6000,
    absorbShutterAtStart: null,
    absorbShutterAtEnd: null,
    rebateOffsetAtStart: null,
    rebateOffsetAtEnd: null,
    rebateExtendAtStart: null,
    rebateExtendAtEnd: null,
    overhangCapAtEnd: null,
    rebateInsets: [{ offsetFromStartMm: 1800, widthMm: 2400 }]
  };
  const next: Wall = { ...baseWall, id: 'w6', hasRebate: false };

  it('steps the shutter run: boards over the BLKs, exact poly inset between', () => {
    const w = computeWall(wall5, 4, rules, { prev, next });
    expect(w.shutters.cuts.map(formatCut)).toEqual([
      '2400', // covers 1800 + 65 (over the BLK), overhang allowed
      'BLK',
      '1800',
      '470p', // inset run 2400 − 2×65 = 2270, exact, polystyrene
      'BLK',
      '2400' // covers 65 + 1800 + corner cap, overhang allowed
    ]);
  });

  it('keeps the rebate exact with the previous-wall deduction and no BLKs', () => {
    const w = computeWall(wall5, 4, rules, { prev, next });
    expect(w.rebate.map((run) => run.cuts.map(formatCut))).toEqual([
      ['1200', '480'], // 1800 − 120 for the previous wall's crossing strip
      ['1800']
    ]);
  });
});

describe('brick terminating mid-wall (inset to the frame line at the corner)', () => {
  it('one BLK at the transition; inset pieces run to the corner', () => {
    const wall: Wall = {
      ...baseWall,
      id: 'w9',
      lengthMm: 6000,
      absorbShutterAtStart: null,
      absorbShutterAtEnd: null,
      rebateOffsetAtStart: null,
      rebateOffsetAtEnd: null,
      rebateExtendAtStart: null,
      rebateExtendAtEnd: null,
      overhangCapAtEnd: null,
      // Brick covers the first 3600; the rest insets to the wall end.
      rebateInsets: [{ offsetFromStartMm: 3600, widthMm: 2400 }]
    };
    const w = computeWall(wall, 0, rules, { prev: baseWall, next: baseWall });
    // Outer board covers 3600 + 65 -> promoted to 4200; single BLK; the
    // inset run (2400 - 65 = 2335, open at the external corner) overhangs.
    expect(w.shutters.cuts.map(formatCut)).toEqual(['4200', 'BLK', '2400']);
    // Rebate stops at the brick line: 3600 - 120 (previous wall) = 3480.
    expect(w.rebate.map((run) => run.cuts.map(formatCut))).toEqual([
      ['3000', '480']
    ]);
  });
});

describe('brick starting mid-wall (bare at the start, brick to the end)', () => {
  const autoFlags = {
    absorbShutterAtStart: null,
    absorbShutterAtEnd: null,
    rebateOffsetAtStart: null,
    rebateOffsetAtEnd: null,
    rebateExtendAtStart: null,
    rebateExtendAtEnd: null,
    overhangCapAtEnd: null
  };
  // Bare for the first 3000 (inset to the frame line), brick 3000 to 6000.
  const wall: Wall = {
    ...baseWall,
    ...autoFlags,
    id: 'w9',
    lengthMm: 6000,
    rebateInsets: [{ offsetFromStartMm: 0, widthMm: 3000 }]
  };

  it('inset run from the corner, one BLK at the transition, outer board to the end', () => {
    const w = computeWall(wall, 0, rules, { prev: baseWall, next: baseWall });
    // Inset run 3000 − 65 (BLK) = 2935 exact with a poly short; the outer
    // board covers 65 + 3000 + the corner cap and overhangs.
    expect(w.shutters.cuts.map(formatCut)).toEqual(['2400', '535p', 'BLK', '3600']);
  });

  it('rebate covers only the brick stretch with no crossing-strip deduction', () => {
    const w = computeWall(wall, 0, rules, { prev: baseWall, next: baseWall });
    // The wall's own strip starts at the brick line, not the corner, so the
    // previous wall's strip never crosses it: 3000 exact.
    expect(w.rebate.map((run) => run.cuts.map(formatCut))).toEqual([['3000']]);
  });

  it('respects an absorb override at the start of the inset run', () => {
    const w = computeWall({ ...wall, absorbShutterAtStart: true }, 0, rules, {
      prev: baseWall,
      next: baseWall
    });
    // 2935 − 65 absorbed = 2870.
    expect(w.shutters.cuts.map(formatCut)).toEqual(['2400', '470p', 'BLK', '3600']);
  });
});

describe('corner rules skip neighbours whose brick stops before the corner', () => {
  const autoFlags = {
    absorbShutterAtStart: null,
    absorbShutterAtEnd: null,
    rebateOffsetAtStart: null,
    rebateOffsetAtEnd: null,
    rebateExtendAtStart: null,
    rebateExtendAtEnd: null,
    overhangCapAtEnd: null
  };

  it('no −120 give-way after a wall whose brick terminated mid-wall', () => {
    // prev's brick stops 2400 before the shared corner; its strip never
    // crosses, so this wall's rebate runs the full 3000.
    const prev: Wall = {
      ...baseWall,
      id: 'w9',
      lengthMm: 6000,
      rebateInsets: [{ offsetFromStartMm: 3600, widthMm: 2400 }]
    };
    const w = computeWall({ ...baseWall, ...autoFlags, id: 'w10' }, 0, rules, {
      prev,
      next: baseWall
    });
    expect(w.rebate.map((run) => run.cuts.map(formatCut))).toEqual([['3000']]);
  });

  it('no +120 extension into a corner the next wall’s brick never reaches', () => {
    // Internal end corner, but the next wall is bare at its start — there
    // is no brick shelf to extend into, so the strip stays exact.
    const next: Wall = {
      ...baseWall,
      id: 'w11',
      lengthMm: 6000,
      rebateInsets: [{ offsetFromStartMm: 0, widthMm: 3000 }]
    };
    const w = computeWall(
      // Offset pinned off so the test isolates the end extension.
      {
        ...baseWall,
        ...autoFlags,
        rebateOffsetAtStart: false,
        id: 'w10',
        cornerEnd: 'internal'
      },
      0,
      rules,
      { prev: baseWall, next }
    );
    expect(w.rebate.map((run) => run.cuts.map(formatCut))).toEqual([['3000']]);
  });
});
