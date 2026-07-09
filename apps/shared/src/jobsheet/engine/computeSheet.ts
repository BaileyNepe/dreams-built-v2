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
import { packRebateForWall, type ResolvedRebateEnds } from './packRebate';
import { packRun } from './packRun';
import { tallyRuns } from './tallies';

/** What the both-ends-internal rule says for this wall, ignoring overrides. */
export const isPolystyreneAuto = (wall: Wall, rules: JobSheetRules): boolean =>
  rules.autoPolystyreneWhenBothEndsInternal &&
  wall.cornerStart === 'internal' &&
  wall.cornerEnd === 'internal';

/** The polystyrene flag actually applied: manual override wins over auto. */
export const resolvePolystyrene = (wall: Wall, rules: JobSheetRules): boolean =>
  wall.polystyreneOverride ?? isPolystyreneAuto(wall, rules);

/**
 * Corner adjustments resolved from the auto convention (the wall arriving
 * at a corner handles it at its end) plus any per-wall overrides.
 */
export type ResolvedEnds = {
  absorbAtStart: boolean;
  absorbAtEnd: boolean;
  overhangCapAtEnd: boolean;
  rebate: ResolvedRebateEnds;
};

export const resolveEnds = (
  wall: Wall,
  neighbours: { prev?: Wall; next?: Wall }
): ResolvedEnds => {
  const prevHasRebate = neighbours.prev?.hasRebate ?? false;
  const nextHasRebate = neighbours.next?.hasRebate ?? false;
  const endInternal = wall.cornerEnd === 'internal';

  return {
    absorbAtStart: wall.absorbShutterAtStart ?? false,
    absorbAtEnd: wall.absorbShutterAtEnd ?? endInternal,
    overhangCapAtEnd: wall.overhangCapAtEnd ?? wall.cornerEnd === 'external',
    rebate: {
      // The departing wall's strip gives way where the previous wall's
      // rebate crosses the corner ("1800 − previous wall").
      offsetAtStart:
        wall.rebateOffsetAtStart ??
        (wall.cornerStart === 'external' && wall.hasRebate && prevHasRebate),
      offsetAtEnd: wall.rebateOffsetAtEnd ?? false,
      extendAtStart: wall.rebateExtendAtStart ?? false,
      extendAtEnd:
        wall.rebateExtendAtEnd ?? (endInternal && wall.hasRebate && nextHasRebate)
    }
  };
};

/** Effective shutter run length after resolved absorb allowances. */
export const computeShutterRunLength = (
  wall: Wall,
  rules: JobSheetRules,
  ends: ResolvedEnds
): number =>
  wall.lengthMm -
  (ends.absorbAtStart ? rules.shutterThicknessMm : 0) -
  (ends.absorbAtEnd ? rules.shutterThicknessMm : 0);

const blkCut = (rules: JobSheetRules): Cut => ({
  kind: 'blk',
  lengthMm: rules.blkLengthMm,
  polystyrene: false
});

/** A PackedRun built verbatim from manually overridden cuts. */
const runFromCuts = (cuts: Cut[]): PackedRun => ({
  effectiveLengthMm: cuts.reduce((acc, c) => acc + c.lengthMm, 0),
  cuts,
  overhangMm: 0
});

export const computeWall = (
  wall: Wall,
  index: number,
  rules: JobSheetRules,
  neighbours: { prev?: Wall; next?: Wall } = {}
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
  const ends = resolveEnds(wall, neighbours);
  const rawLength = computeShutterRunLength(wall, rules, ends);
  let effective = rawLength;
  if (rawLength < 0) {
    warnings.push(
      `Absorb allowances exceed the wall length by ${-rawLength}mm — shutter run packed as empty.`
    );
    effective = 0;
  }

  // Cap the next wall's board: pack to at least one board past the corner.
  const capExtra =
    effective > 0 && ends.overhangCapAtEnd ? rules.shutterThicknessMm : 0;

  const polystyrene = resolvePolystyrene(wall, rules);

  // Partial-rebate walls step the shutter run itself: outer boards over
  // each brick portion cover the portion plus one BLK width and may
  // overhang; BLK insets form the steps; the inset run between them is
  // span − 2×BLK, packed exactly, its shorts polystyrene-padded (the
  // channel is enclosed at both ends).
  const blkSpans = wall.hasRebate
    ? [...wall.openings]
        .filter((o) => !o.hasRebate && o.blk && o.widthMm > 0)
        .sort((a, b) => a.offsetFromStartMm - b.offsetFromStartMm)
    : [];

  let shutters;
  if (effective > 0 && blkSpans.length > 0) {
    const thickness = rules.shutterThicknessMm;
    const cuts: Cut[] = [];
    let cursor = 0;
    blkSpans.forEach((opening, k) => {
      const portion =
        opening.offsetFromStartMm - cursor - (k === 0 && ends.absorbAtStart ? thickness : 0);
      const board = packRun(
        Math.max(0, portion + thickness),
        { overhangAtEnd: true, polystyreneShort: polystyrene },
        rules
      );
      cuts.push(...board.cuts, blkCut(rules));
      const inset = packRun(
        Math.max(0, opening.widthMm - 2 * thickness),
        { overhangAtEnd: false, polystyreneShort: true },
        rules
      );
      cuts.push(...inset.cuts, blkCut(rules));
      cursor = opening.offsetFromStartMm + opening.widthMm;
    });
    const lastPortion =
      wall.lengthMm - cursor - (ends.absorbAtEnd ? thickness : 0);
    const lastBoard = packRun(
      Math.max(0, lastPortion + thickness + capExtra),
      {
        overhangAtEnd: wall.cornerEnd === 'external',
        polystyreneShort: polystyrene,
        angleDeg: wall.angledCornerDeg
      },
      rules
    );
    cuts.push(...lastBoard.cuts);
    shutters = { effectiveLengthMm: effective, cuts, overhangMm: lastBoard.overhangMm + capExtra };
  } else {
    const packed = packRun(
      effective + capExtra,
      {
        overhangAtEnd: wall.cornerEnd === 'external',
        polystyreneShort: polystyrene,
        angleDeg: wall.angledCornerDeg
      },
      rules
    );
    shutters = {
      ...packed,
      effectiveLengthMm: effective,
      overhangMm: packed.overhangMm + capExtra
    };
  }

  if (wall.blkAtStart || wall.blkAtEnd) {
    shutters.cuts = [
      ...(wall.blkAtStart ? [blkCut(rules)] : []),
      ...shutters.cuts,
      ...(wall.blkAtEnd ? [blkCut(rules)] : [])
    ];
  }

  return {
    id: wall.id,
    number,
    lengthMm: wall.lengthMm,
    shutters,
    rebate: packRebateForWall(wall, rules, polystyrene, ends.rebate),
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
  const walls = data.walls.map((wall, index) =>
    computeWall(wall, index, rules, {
      prev: data.walls[(index - 1 + data.walls.length) % data.walls.length],
      next: data.walls[(index + 1) % data.walls.length]
    })
  );
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
