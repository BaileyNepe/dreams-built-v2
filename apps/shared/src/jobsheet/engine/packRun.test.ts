import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import type { Wall } from '../types';
import { computeShutterRunLength, resolveEnds } from './computeSheet';
import { packRun } from './packRun';

const rules = DEFAULT_JOBSHEET_RULES;

const pack = (lengthMm: number, overhangAtEnd: boolean, polystyreneShort = false) =>
  packRun(lengthMm, { overhangAtEnd, polystyreneShort }, rules);

const lengths = (result: ReturnType<typeof pack>) =>
  result.cuts.map((c) => c.lengthMm);

describe('packRun: exact fits', () => {
  it('packs an exact 4800 wall as one 4800 cut with no overhang', () => {
    const result = pack(4800, false);
    expect(result.cuts).toEqual([
      { kind: 'standard', lengthMm: 4800, polystyrene: false }
    ]);
    expect(result.overhangMm).toBe(0);
  });

  it('packs a 600 wall as a single 600 cut', () => {
    const result = pack(600, false);
    expect(lengths(result)).toEqual([600]);
    expect(result.overhangMm).toBe(0);
  });

  it('packs 5980 with no overhang as 4800 + 600 + 580 short (wall 6)', () => {
    const result = pack(5980, false);
    expect(lengths(result)).toEqual([4800, 600, 580]);
    expect(result.cuts[2]).toMatchObject({ kind: 'short' });
    expect(result.overhangMm).toBe(0);
  });
});

describe('packRun: overhang behaviour (promotion)', () => {
  it('uses overhang to avoid a short when allowed (wall 1: 6420 -> 4800 + 1800, 180mm)', () => {
    const result = pack(6420, true);
    expect(lengths(result)).toEqual([4800, 1800]);
    expect(result.cuts.every((c) => c.kind === 'standard')).toBe(true);
    expect(result.overhangMm).toBe(180);
  });

  it('promotes a single-piece wall (wall 11: 4480 -> [4800], 320mm)', () => {
    const result = pack(4480, true);
    expect(lengths(result)).toEqual([4800]);
    expect(result.overhangMm).toBe(320);
  });

  it('promotes across a size step (wall 10: 3780 -> [4200], 420mm)', () => {
    const result = pack(3780, true);
    expect(lengths(result)).toEqual([4200]);
    expect(result.overhangMm).toBe(420);
  });

  it('promotes rather than adding a piece (1500 -> [1800], 300mm)', () => {
    const result = pack(1500, true);
    expect(lengths(result)).toEqual([1800]);
    expect(result.overhangMm).toBe(300);
  });

  it('adds a piece when the last is already the largest (wall 8: 5010 -> [4800, 600], 390mm)', () => {
    const result = pack(5010, true);
    expect(lengths(result)).toEqual([4800, 600]);
    expect(result.overhangMm).toBe(390);
  });

  it('promotes the trailing 600 to 1200 (wall 4: 5940 -> [4800, 1200], 60mm)', () => {
    const result = pack(5940, true);
    expect(lengths(result)).toEqual([4800, 1200]);
    expect(result.overhangMm).toBe(60);
  });

  it('promotes the trailing 4200 to 4800 (wall 5: 14270 -> [4800, 4800, 4800], 130mm)', () => {
    const result = pack(14270, true);
    expect(lengths(result)).toEqual([4800, 4800, 4800]);
    expect(result.overhangMm).toBe(130);
  });

  it('matches the screenshot behaviour: 3380 -> [3600], 330 -> [600]', () => {
    expect(lengths(pack(3380, true))).toEqual([3600]);
    expect(pack(3380, true).overhangMm).toBe(220);
    expect(lengths(pack(330, true))).toEqual([600]);
    expect(pack(330, true).overhangMm).toBe(270);
  });

  it('does not overhang when overhangAtEnd=false even on a tight remainder', () => {
    const result = pack(6420, false);
    expect(lengths(result)).toEqual([4800, 1200, 420]);
    expect(result.cuts[2]).toMatchObject({ kind: 'short', polystyrene: false });
    expect(result.overhangMm).toBe(0);
  });

  it('marks the trailing short as polystyrene when requested', () => {
    const result = pack(1620, false, true);
    expect(lengths(result)).toEqual([1200, 420]);
    expect(result.cuts[1]).toMatchObject({ kind: 'short', polystyrene: true });
    expect(result.overhangMm).toBe(0);
  });

  it('does not mark non-short cuts as polystyrene even when the option is set', () => {
    const result = pack(4800, false, true);
    expect(result.cuts).toEqual([
      { kind: 'standard', lengthMm: 4800, polystyrene: false }
    ]);
  });
});

describe('packRun: worked examples from the spec', () => {
  it('9200 with no overhang -> 4800 + 4200 + 200 short', () => {
    const result = pack(9200, false);
    expect(lengths(result)).toEqual([4800, 4200, 200]);
    expect(result.cuts[2]).toMatchObject({ kind: 'short' });
  });

  it('6000 -> 4800 + 1200 exactly', () => {
    const result = pack(6000, false);
    expect(lengths(result)).toEqual([4800, 1200]);
    expect(result.overhangMm).toBe(0);
  });

  it('3300 with no overhang -> 3000 + 300 short', () => {
    expect(lengths(pack(3300, false))).toEqual([3000, 300]);
  });

  it('2400 -> exact single piece', () => {
    const result = pack(2400, false);
    expect(lengths(result)).toEqual([2400]);
    expect(result.overhangMm).toBe(0);
  });
});

describe('packRun: edge cases', () => {
  it('returns an empty packed run for length 0', () => {
    const result = pack(0, false);
    expect(result.cuts).toEqual([]);
    expect(result.overhangMm).toBe(0);
    expect(result.effectiveLengthMm).toBe(0);
  });

  it('throws on a negative length', () => {
    expect(() => pack(-10, false)).toThrow();
  });

  it('packs a sub-600 wall as a single short when no overhang allowed', () => {
    const result = pack(450, false);
    expect(result.cuts).toEqual([
      { kind: 'short', lengthMm: 450, polystyrene: false }
    ]);
  });

  it('upgrades a sub-600 wall to a 600 standard with overhang when allowed', () => {
    const result = pack(450, true);
    expect(result.cuts).toEqual([
      { kind: 'standard', lengthMm: 600, polystyrene: false }
    ]);
    expect(result.overhangMm).toBe(150);
  });

  it('annotates a short with the corner angle when provided', () => {
    const result = packRun(
      3300,
      { overhangAtEnd: false, angleDeg: 45 },
      rules
    );
    expect(result.cuts[1]).toMatchObject({ kind: 'short', lengthMm: 300, angleDeg: 45 });
  });
});

describe('computeShutterRunLength', () => {
  const baseWall: Wall = {
    id: 'w1',
    foundationId: 'main',
    lengthMm: 1620,
    cornerStart: 'internal',
    cornerEnd: 'internal',
    absorbShutterAtStart: false,
    absorbShutterAtEnd: false,
    hasRebate: false,
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
  const endsFor = (wall: Wall) => resolveEnds(wall, {});

  it('returns the wall length untouched with no absorb flags', () => {
    const wall = { ...baseWall, lengthMm: 4480 };
    expect(computeShutterRunLength(wall, rules, endsFor(wall))).toBe(4480);
  });

  it('subtracts one shutter thickness per absorbing end', () => {
    const one = { ...baseWall, absorbShutterAtEnd: true };
    expect(computeShutterRunLength(one, rules, endsFor(one))).toBe(1555);
    const both = { ...baseWall, absorbShutterAtStart: true, absorbShutterAtEnd: true };
    expect(computeShutterRunLength(both, rules, endsFor(both))).toBe(1490);
  });

  it('absorbs automatically at an internal START corner when unset (auto)', () => {
    // The run goes until it hits the next wall; the wall LEAVING an
    // internal corner starts one board thickness in, because the previous
    // wall's board already sits against its face.
    const departing = { ...baseWall, cornerStart: 'internal' as const, absorbShutterAtStart: null };
    expect(computeShutterRunLength(departing, rules, endsFor(departing))).toBe(1555);
    // The arriving wall no longer absorbs at its internal end by default.
    const arriving = { ...baseWall, absorbShutterAtEnd: null };
    expect(computeShutterRunLength(arriving, rules, endsFor(arriving))).toBe(1620);
  });

  it('goes negative (not throwing) when allowances exceed the length', () => {
    const wall = {
      ...baseWall,
      lengthMm: 100,
      absorbShutterAtStart: true,
      absorbShutterAtEnd: true
    };
    expect(computeShutterRunLength(wall, rules, endsFor(wall))).toBe(-30);
  });
});
