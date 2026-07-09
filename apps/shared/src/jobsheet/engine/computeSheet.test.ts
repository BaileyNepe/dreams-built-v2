/**
 * Golden parity test: the 9 Warren Lane fixture must produce shutter and
 * rebate cut lists that match the QS-issued job sheet exactly. Any drift
 * here is either an engine regression or a fixture entry whose corner /
 * opening metadata was misread.
 *
 * Cuts are compared as formatted strings (one per cut, in trade order)
 * because that is the format the trade actually reads; tallies as object
 * literals so a missed-by-one is loud.
 */

import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import { nineWarrenLaneData, NINE_WARREN_LANE_PERIMETER_MM } from '../fixtures/nineWarrenLane';
import { computeJobSheet, isPolystyreneAuto, resolvePolystyrene } from './computeSheet';
import { formatCut } from './format';

const rules = DEFAULT_JOBSHEET_RULES;

describe('computeJobSheet: 9 Warren Lane (job 26035)', () => {
  const sheet = computeJobSheet(nineWarrenLaneData, rules);

  const shutterRow = (n: number): string[] => {
    const w = sheet.walls.find((x) => x.number === n);
    if (!w) throw new Error(`wall ${n} not found`);
    return w.shutters.cuts.map(formatCut);
  };

  const rebateRow = (n: number): string[] => {
    const w = sheet.walls.find((x) => x.number === n);
    if (!w) throw new Error(`wall ${n} not found`);
    return w.rebate.flatMap((seg) => seg.cuts.map(formatCut));
  };

  it('totals the foundation perimeter at 66160mm (matches A206 "Over Foundation Area")', () => {
    expect(sheet.perimeterMm).toBe(NINE_WARREN_LANE_PERIMETER_MM);
  });

  it('numbers walls from array order, garage-door wall first', () => {
    expect(sheet.walls.map((w) => w.number)).toEqual(
      Array.from({ length: 14 }, (_, i) => i + 1)
    );
    expect(sheet.walls[0].id).toBe('w01');
  });

  // Shutter cut lists, transcribed from the QS-issued job sheet.
  const expectedShutters: ReadonlyArray<readonly [number, readonly string[]]> = [
    [1, ['4800', '1800']],
    [2, ['4800', '2400']],
    [3, ['1800', '260']],
    [4, ['4800', '1200']],
    [5, ['4800', '4800', '4800']],
    [6, ['4800', '600', '580']],
    [7, ['600']],
    [8, ['4800', '600']],
    [9, ['4200', '210']],
    [10, ['4200']],
    [11, ['4800']],
    [12, ['3000', '200']],
    [13, ['1200', '355p']],
    [14, ['1800']]
  ];
  for (const [n, expected] of expectedShutters) {
    it(`packs wall ${n} shutters as [${expected.join(' ')}]`, () => {
      expect(shutterRow(n)).toEqual([...expected]);
    });
  }

  // Rebate cut lists from the QS sheet. Walls 10-13 have hasRebate=false.
  const expectedRebate: ReadonlyArray<readonly [number, readonly string[]]> = [
    [1, ['600', '185', '600', '185']],
    [2, ['4800', '1800', '290']],
    [3, ['1800', '260']],
    [4, ['4800', '600', '540']],
    [5, ['4800', '4800', '4200', '350']],
    [6, ['4800', '600', '580']],
    [7, ['600']],
    [8, ['4800', '90']],
    [9, ['4200', '90']],
    [10, []],
    [11, []],
    [12, []],
    [13, []],
    [14, ['1200', '60']]
  ];
  for (const [n, expected] of expectedRebate) {
    it(`packs wall ${n} rebate as [${expected.join(' ')}]`, () => {
      expect(rebateRow(n)).toEqual([...expected]);
    });
  }

  it('produces the expected shutter tally', () => {
    expect(sheet.tallies.shutters).toEqual({
      4800: 9,
      4200: 2,
      3600: 0,
      3000: 1,
      2400: 1,
      1800: 3,
      1200: 2,
      600: 3,
      shorts: 5,
      blk: 0
    });
  });

  it('produces the expected rebate tally', () => {
    expect(sheet.tallies.rebate).toEqual({
      4800: 6,
      4200: 2,
      3600: 0,
      3000: 0,
      2400: 0,
      1800: 2,
      1200: 1,
      600: 5,
      shorts: 10,
      blk: 0
    });
  });

  it('flags the polystyrene short on wall 13 via the both-ends-internal auto rule', () => {
    const w = sheet.walls.find((x) => x.number === 13);
    expect(w?.polystyreneAuto).toBe(true);
    expect(w?.shutters.cuts.some((c) => c.polystyrene)).toBe(true);
    expect(w?.notes).toBe(
      'Inset wall: tight fit, polystyrene padding on short shutter.'
    );
  });

  it('reports no warnings and no overrides on the fixture', () => {
    expect(sheet.walls.every((w) => w.warnings.length === 0)).toBe(true);
    expect(sheet.walls.every((w) => !w.isOverridden)).toBe(true);
  });
});

describe('computeJobSheet: safety on transient editor states', () => {
  const wall = nineWarrenLaneData.walls[12]; // w13, 1620mm, absorbs at end

  it('packs a 0-length (blank) wall as empty runs instead of failing', () => {
    const sheet = computeJobSheet(
      {
        ...nineWarrenLaneData,
        walls: [{ ...wall, lengthMm: 0, absorbShutterAtEnd: false }]
      },
      rules
    );
    expect(sheet.walls[0].shutters.cuts).toEqual([]);
    expect(sheet.walls[0].rebate).toEqual([]);
    expect(sheet.perimeterMm).toBe(0);
  });

  it('clamps and warns when absorb allowances exceed the wall length', () => {
    const sheet = computeJobSheet(
      {
        ...nineWarrenLaneData,
        walls: [
          {
            ...wall,
            lengthMm: 100,
            absorbShutterAtStart: true,
            absorbShutterAtEnd: true
          }
        ]
      },
      rules
    );
    expect(sheet.walls[0].shutters.cuts).toEqual([]);
    expect(sheet.walls[0].warnings.length).toBe(1);
  });
});

describe('polystyrene resolution', () => {
  const wall = nineWarrenLaneData.walls[6]; // w07: both ends internal

  it('is auto-on only when both ends are internal and the rule is enabled', () => {
    expect(isPolystyreneAuto(wall, rules)).toBe(true);
    expect(isPolystyreneAuto({ ...wall, cornerStart: 'external' }, rules)).toBe(false);
    expect(
      isPolystyreneAuto(wall, {
        ...rules,
        autoPolystyreneWhenBothEndsInternal: false
      })
    ).toBe(false);
  });

  it('lets a manual override win in both directions', () => {
    expect(resolvePolystyrene({ ...wall, polystyreneOverride: false }, rules)).toBe(
      false
    );
    expect(
      resolvePolystyrene(
        { ...wall, cornerStart: 'external', polystyreneOverride: true },
        rules
      )
    ).toBe(true);
  });
});
