import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import type { Cut, JobSheetRules, PackedRun } from '../types';
import { emptyTally, tallyRuns } from './tallies';

// Expectations in this file were hand-computed at the prototype's 65mm
// shutter thickness; the live default is now 45. Pin 65 so the numbers
// stay meaningful (the engine is fully parameterised by rules).
const rules = { ...DEFAULT_JOBSHEET_RULES, shutterThicknessMm: 65 };

const run = (standards: number[], shorts: number[] = [], blks = 0): PackedRun => {
  const cuts: Cut[] = [
    ...standards.map(
      (lengthMm): Cut => ({ kind: 'standard', lengthMm, polystyrene: false })
    ),
    ...shorts.map(
      (lengthMm): Cut => ({ kind: 'short', lengthMm, polystyrene: false })
    ),
    ...Array.from(
      { length: blks },
      (): Cut => ({ kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false })
    )
  ];
  return {
    effectiveLengthMm: cuts.reduce((a, c) => a + c.lengthMm, 0),
    cuts,
    overhangMm: 0
  };
};

describe('tallyRuns', () => {
  it('returns an all-zero tally for an empty input', () => {
    expect(tallyRuns([], rules)).toEqual({
      4800: 0,
      4200: 0,
      3600: 0,
      3000: 0,
      2400: 0,
      1800: 0,
      1200: 0,
      600: 0,
      shorts: 0,
      blk: 0
    });
  });

  it('counts standard sizes, shorts and BLKs across multiple runs', () => {
    const tally = tallyRuns(
      [run([4800, 1800], [180]), run([4800, 2400], [], 1), run([1800], [260])],
      rules
    );
    expect(tally).toEqual({
      4800: 2,
      4200: 0,
      3600: 0,
      3000: 0,
      2400: 1,
      1800: 2,
      1200: 0,
      600: 0,
      shorts: 2,
      blk: 1
    });
  });

  it('counts a non-standard-length standard cut as a short defensively', () => {
    const oddRun: PackedRun = {
      effectiveLengthMm: 1234,
      cuts: [{ kind: 'standard', lengthMm: 1234, polystyrene: false }],
      overhangMm: 0
    };
    expect(tallyRuns([oddRun], rules).shorts).toBe(1);
  });

  it('keys the tally off the rule set, not hard-coded sizes', () => {
    const customRules: JobSheetRules = {
      ...rules,
      standardSizesMm: [2000, 1000]
    };
    expect(emptyTally(customRules)).toEqual({
      2000: 0,
      1000: 0,
      shorts: 0,
      blk: 0
    });
    const tally = tallyRuns(
      [
        {
          effectiveLengthMm: 3000,
          cuts: [
            { kind: 'standard', lengthMm: 2000, polystyrene: false },
            { kind: 'standard', lengthMm: 1000, polystyrene: false }
          ],
          overhangMm: 0
        }
      ],
      customRules
    );
    expect(tally['2000']).toBe(1);
    expect(tally['1000']).toBe(1);
  });
});
