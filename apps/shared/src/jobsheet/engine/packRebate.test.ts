import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import type { Wall } from '../types';
import { packRebateForWall, type ResolvedRebateEnds } from './packRebate';

const rules = DEFAULT_JOBSHEET_RULES;

const baseWall: Wall = {
  id: 'w1',
  foundationId: 'main',
  lengthMm: 1000,
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

const ends = (patch: Partial<ResolvedRebateEnds> = {}): ResolvedRebateEnds => ({
  offsetAtStart: false,
  offsetAtEnd: false,
  extendAtStart: false,
  extendAtEnd: false,
  ...patch
});

const lengths = (runs: ReturnType<typeof packRebateForWall>) =>
  runs.map((run) => run.cuts.map((c) => c.lengthMm));

describe('packRebateForWall: walls with no brick rebate', () => {
  it('returns an empty array for a wall flagged hasRebate=false', () => {
    expect(packRebateForWall({ ...baseWall, hasRebate: false }, rules, false, ends())).toEqual(
      []
    );
  });
});

describe('packRebateForWall: simple walls', () => {
  it('packs a wall with no offsets and no openings as a single segment', () => {
    // 9 Warren Lane wall 3: 2060mm, no offset -> 1800 + 260 short.
    const result = packRebateForWall({ ...baseWall, lengthMm: 2060 }, rules, false, ends());
    expect(lengths(result)).toEqual([[1800, 260]]);
    expect(result[0].cuts[1]).toMatchObject({ kind: 'short' });
  });

  it('subtracts the offset at the start (wall 2: 7010 -> 6890 -> 4800 + 1800 + 290)', () => {
    const result = packRebateForWall(
      { ...baseWall, lengthMm: 7010 },
      rules,
      false,
      ends({ offsetAtStart: true })
    );
    expect(lengths(result)).toEqual([[4800, 1800, 290]]);
  });

  it('subtracts the offset at the end (wall 5: 14270 -> 14150 -> 4800 + 4800 + 4200 + 350)', () => {
    const result = packRebateForWall(
      { ...baseWall, lengthMm: 14270 },
      rules,
      false,
      ends({ offsetAtEnd: true })
    );
    expect(lengths(result)).toEqual([[4800, 4800, 4200, 350]]);
  });

  it('never overhangs, even at an external corner end', () => {
    const result = packRebateForWall({ ...baseWall, lengthMm: 3380 }, rules, false, ends());
    // Shutter packing with overhang would give [3600]; rebate must not.
    expect(lengths(result)).toEqual([[3000, 380]]);
  });
});

describe('packRebateForWall: openings split the run', () => {
  it('splits around a non-rebated opening (wall 1 garage door: 2x 785 = 600 + 185 each)', () => {
    const result = packRebateForWall(
      {
        ...baseWall,
        lengthMm: 6420,
        openings: [
          {
            kind: 'garage_door',
            widthMm: 4850,
            offsetFromStartMm: 785,
            hasRebate: false,
            blk: false,
            label: 'Garage Door'
          }
        ]
      },
      rules,
      false,
      ends()
    );
    expect(lengths(result)).toEqual([
      [600, 185],
      [600, 185]
    ]);
  });

  it('keeps the rebate continuous when an opening is flagged hasRebate=true', () => {
    const result = packRebateForWall(
      {
        ...baseWall,
        lengthMm: 3000,
        openings: [
          { kind: 'window', widthMm: 900, offsetFromStartMm: 1000, hasRebate: true, blk: false }
        ]
      },
      rules,
      false,
      ends()
    );
    expect(lengths(result)).toEqual([[3000]]);
  });
});

describe('packRebateForWall: polystyrene flag', () => {
  it('marks shorts as polystyrene when the resolved flag is set', () => {
    const [run] = packRebateForWall({ ...baseWall, lengthMm: 2060 }, rules, true, ends());
    expect(run.cuts[1]).toMatchObject({ kind: 'short', polystyrene: true });
  });

  it('leaves shorts unflagged when the resolved flag is false', () => {
    const [run] = packRebateForWall(
      { ...baseWall, lengthMm: 2060, cornerEnd: 'internal' },
      rules,
      false,
      ends()
    );
    expect(run.cuts[1]).toMatchObject({ kind: 'short', polystyrene: false });
  });

  it('does not mark non-short cuts as polystyrene even when flagged', () => {
    const [run] = packRebateForWall({ ...baseWall, lengthMm: 4800 }, rules, true, ends());
    expect(run.cuts).toEqual([
      { kind: 'standard', lengthMm: 4800, polystyrene: false }
    ]);
  });
});

describe('packRebateForWall: degenerate cases', () => {
  it('returns no segments when offsets eat the whole wall', () => {
    const result = packRebateForWall(
      { ...baseWall, lengthMm: 200 },
      rules,
      false,
      ends({ offsetAtStart: true, offsetAtEnd: true })
    );
    expect(result).toEqual([]);
  });

  it('clips an opening that overlaps the offset zone', () => {
    // Offset zone covers the first 120mm; an opening spanning 100-300 only
    // breaks the run from 120-300, leaving a single 2700mm segment.
    const result = packRebateForWall(
      {
        ...baseWall,
        lengthMm: 3000,
        openings: [
          { kind: 'window', widthMm: 200, offsetFromStartMm: 100, hasRebate: false, blk: false }
        ]
      },
      rules,
      false,
      ends({ offsetAtStart: true })
    );
    expect(result).toHaveLength(1);
    expect(result[0].effectiveLengthMm).toBe(2700);
  });
});
