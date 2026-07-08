/**
 * Compute a full job sheet from authored data + rules.
 *
 * Pure and total: no I/O, and it never throws on a well-formed
 * `JobSheetData` — transiently invalid wall states (absorb allowances
 * exceeding the wall length) clamp to zero and surface as per-wall warnings
 * so live editing never crashes.
 */

import type {
  ComputedSheet,
  ComputedWall,
  Cut,
  JobSheetData,
  JobSheetRules,
  PackedRun,
  Wall
} from '../types';
import { packRebateForWall } from './packRebate';
import { computeShutterRunLength, packRun } from './packRun';
import { tallyRuns } from './tallies';

/** What the both-ends-internal rule says for this wall, ignoring overrides. */
export const isPolystyreneAuto = (wall: Wall, rules: JobSheetRules): boolean =>
  rules.autoPolystyreneWhenBothEndsInternal &&
  wall.cornerStart === 'internal' &&
  wall.cornerEnd === 'internal';

/** The polystyrene flag actually applied: manual override wins over auto. */
export const resolvePolystyrene = (wall: Wall, rules: JobSheetRules): boolean =>
  wall.polystyreneOverride ?? isPolystyreneAuto(wall, rules);

const blkCut = (rules: JobSheetRules): Cut => ({
  kind: 'blk',
  lengthMm: rules.blkLengthMm,
  polystyrene: false
});

/**
 * Whether a BLK inset consumes packed run length (true) or is purely an
 * additive marker piece (false).
 *
 * TODO(bailey): confirm against a real sheet — job 26055 wall 12 shows BLK
 * mid-run in the 300 column, which manual overrides cover either way.
 */
const BLK_CONSUMES_LENGTH = false;

/** A PackedRun built verbatim from manually overridden cuts. */
const runFromCuts = (cuts: Cut[]): PackedRun => ({
  effectiveLengthMm: cuts.reduce((acc, c) => acc + c.lengthMm, 0),
  cuts,
  overhangMm: 0
});

export const computeWall = (
  wall: Wall,
  index: number,
  rules: JobSheetRules
): ComputedWall => {
  const number = index + 1;
  const polystyreneAuto = isPolystyreneAuto(wall, rules);

  if (wall.override) {
    return {
      id: wall.id,
      number,
      lengthMm: wall.lengthMm,
      shutters: runFromCuts(wall.override.shutterCuts),
      rebate: wall.override.rebateRuns.map(runFromCuts),
      isOverridden: true,
      polystyreneAuto,
      warnings: [],
      notes: wall.notes
    };
  }

  const warnings: string[] = [];
  const rawLength = computeShutterRunLength(wall, rules);
  let effective = rawLength;
  if (rawLength < 0) {
    warnings.push(
      `Absorb allowances exceed the wall length by ${-rawLength}mm — shutter run packed as empty.`
    );
    effective = 0;
  }

  const polystyrene = resolvePolystyrene(wall, rules);
  const shutters = packRun(
    effective,
    {
      overhangAtEnd: wall.cornerEnd === 'external',
      polystyreneShort: polystyrene,
      angleDeg: wall.angledCornerDeg
    },
    rules
  );

  if (wall.blkAtStart || wall.blkAtEnd) {
    const cuts = [
      ...(wall.blkAtStart ? [blkCut(rules)] : []),
      ...shutters.cuts,
      ...(wall.blkAtEnd ? [blkCut(rules)] : [])
    ];
    shutters.cuts = cuts;
    if (BLK_CONSUMES_LENGTH) {
      // Placeholder for the alternative semantics: repack with the BLK
      // lengths subtracted from the effective run.
      warnings.push('BLK length-consumption semantics not confirmed yet.');
    }
  }

  return {
    id: wall.id,
    number,
    lengthMm: wall.lengthMm,
    shutters,
    rebate: packRebateForWall(wall, rules, polystyrene),
    isOverridden: false,
    polystyreneAuto,
    warnings,
    notes: wall.notes
  };
};

export const computeJobSheet = (
  data: JobSheetData,
  rules: JobSheetRules
): ComputedSheet => {
  const walls = data.walls.map((wall, index) => computeWall(wall, index, rules));
  const perimeterMm = data.walls.reduce((acc, w) => acc + w.lengthMm, 0);

  return {
    walls,
    perimeterMm,
    tallies: {
      shutters: tallyRuns(
        walls.map((w) => w.shutters),
        rules
      ),
      rebate: tallyRuns(
        walls.flatMap((w) => w.rebate),
        rules
      )
    }
  };
};
