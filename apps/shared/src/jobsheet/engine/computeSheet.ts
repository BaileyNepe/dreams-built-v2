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
 * Whether the wall's brick shelf actually reaches its start/end corner —
 * false when the wall has no rebate or a rebate inset covers that corner
 * (brick stops before it and the slab edge steps to the frame line).
 */
export const rebateReachesStart = (wall: Wall): boolean =>
  wall.hasRebate &&
  !wall.rebateInsets.some(
    (inset) =>
      inset.widthMm > 0 &&
      inset.offsetFromStartMm <= 0 &&
      inset.offsetFromStartMm + inset.widthMm > 0
  );

export const rebateReachesEnd = (wall: Wall): boolean =>
  wall.hasRebate &&
  !wall.rebateInsets.some(
    (inset) =>
      inset.widthMm > 0 &&
      inset.offsetFromStartMm < wall.lengthMm &&
      inset.offsetFromStartMm + inset.widthMm >= wall.lengthMm
  );

/**
 * Corner adjustments resolved from the auto convention plus any per-wall
 * overrides. Shutters: a run goes until it hits the next wall (internal
 * end — exact) or overflows past it (external end — overhang cap); the
 * wall LEAVING an internal corner starts one board thickness in, because
 * the previous wall's board already sits against its face. Exception:
 * wall 1 is boxed first — nothing is there yet, so it always starts from
 * the very beginning of its face, and the LAST wall accounts for wall 1's
 * board at the closing corner instead. Rebate joints stay with the
 * arriving wall (offset/extend at its end by corner kind).
 */
export type ResolvedEnds = {
  absorbAtStart: boolean;
  absorbAtEnd: boolean;
  overhangCapAtEnd: boolean;
  rebate: ResolvedRebateEnds;
};

export const resolveEnds = (
  wall: Wall,
  neighbours: { prev?: Wall; next?: Wall; isFirst?: boolean; isLast?: boolean }
): ResolvedEnds => {
  // Corner rebate joints only exist where BOTH strips reach the corner —
  // a neighbour whose brick stops before the corner never crosses it.
  const prevReaches = neighbours.prev ? rebateReachesEnd(neighbours.prev) : false;
  const nextReaches = neighbours.next ? rebateReachesStart(neighbours.next) : false;
  const endInternal = wall.cornerEnd === 'internal';

  return {
    absorbAtStart:
      wall.absorbShutterAtStart ??
      (!(neighbours.isFirst ?? false) && wall.cornerStart === 'internal'),
    absorbAtEnd: wall.absorbShutterAtEnd ?? ((neighbours.isLast ?? false) && endInternal),
    overhangCapAtEnd: wall.overhangCapAtEnd ?? wall.cornerEnd === 'external',
    rebate: {
      // The departing wall's strip gives way where the previous wall's
      // rebate crosses the corner ("1800 − previous wall"). Wall 1 is
      // bricked first, so its strip runs from its very beginning — the
      // LAST wall takes the give-way at its end at the closing corner.
      offsetAtStart:
        wall.rebateOffsetAtStart ??
        (!(neighbours.isFirst ?? false) &&
          wall.cornerStart === 'external' &&
          rebateReachesStart(wall) &&
          prevReaches),
      offsetAtEnd:
        wall.rebateOffsetAtEnd ??
        ((neighbours.isLast ?? false) &&
          wall.cornerEnd === 'external' &&
          rebateReachesEnd(wall) &&
          nextReaches),
      extendAtStart: wall.rebateExtendAtStart ?? false,
      extendAtEnd:
        wall.rebateExtendAtEnd ?? (endInternal && rebateReachesEnd(wall) && nextReaches)
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
  neighbours: { prev?: Wall; next?: Wall; isFirst?: boolean; isLast?: boolean } = {}
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
    ? [...wall.rebateInsets]
        .filter((inset) => inset.widthMm > 0)
        .sort((a, b) => a.offsetFromStartMm - b.offsetFromStartMm)
    : [];

  let shutters;
  if (effective > 0 && blkSpans.length > 0) {
    const thickness = rules.shutterThicknessMm;
    const cuts: Cut[] = [];
    let cursor = ends.absorbAtStart ? thickness : 0;
    let endOverhang = 0;
    blkSpans.forEach((span) => {
      const spanStart = Math.max(0, span.offsetFromStartMm);
      const spanEnd = Math.min(wall.lengthMm, span.offsetFromStartMm + span.widthMm);
      const leadingBlk = spanStart > cursor;
      const trailingBlk = spanEnd < wall.lengthMm;
      if (leadingBlk) {
        // Outer board over the brick portion, covering the BLK; may overhang.
        const board = packRun(
          Math.max(0, spanStart - cursor + thickness),
          { overhangAtEnd: true, polystyreneShort: polystyrene },
          rules
        );
        cuts.push(...board.cuts, blkCut(rules));
      }
      // Inset run along the frame line; enclosed ends get poly shorts. The
      // entering BLK sits inside the channel and consumes one board
      // thickness; the outset BLK stands above the shutter at the step, so
      // the run goes all the way to the outset line. A span reaching a
      // wall end is open at the corner instead, so the usual corner rules
      // apply there (absorb, overhang, cap).
      const insetStart = leadingBlk ? spanStart + thickness : cursor;
      const insetEnd = trailingBlk
        ? spanEnd
        : spanEnd - (ends.absorbAtEnd ? thickness : 0);
      const inset = packRun(
        Math.max(0, insetEnd - insetStart + (trailingBlk ? 0 : capExtra)),
        {
          overhangAtEnd: !trailingBlk && wall.cornerEnd === 'external',
          polystyreneShort: true,
          angleDeg: trailingBlk ? null : wall.angledCornerDeg
        },
        rules
      );
      cuts.push(...inset.cuts);
      if (trailingBlk) cuts.push(blkCut(rules));
      else endOverhang = inset.overhangMm + capExtra;
      // The board after the step starts clear of the BLK at the brick
      // line — no overlap (the BLK fills shutter-to-brick-line itself).
      cursor = spanEnd;
    });
    if (cursor < wall.lengthMm) {
      const lastBoard = packRun(
        Math.max(
          0,
          wall.lengthMm - cursor - (ends.absorbAtEnd ? thickness : 0) + capExtra
        ),
        {
          overhangAtEnd: wall.cornerEnd === 'external',
          polystyreneShort: polystyrene,
          angleDeg: wall.angledCornerDeg
        },
        rules
      );
      cuts.push(...lastBoard.cuts);
      shutters = {
        effectiveLengthMm: effective,
        cuts,
        overhangMm: lastBoard.overhangMm + capExtra
      };
    } else {
      shutters = { effectiveLengthMm: effective, cuts, overhangMm: endOverhang };
    }
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

/** Manual mode: hand-placed cut lists, no corner logic, no packing. */
const computeManualSheet = (data: JobSheetData, rules: JobSheetRules): ComputedSheet => {
  const walls = data.walls.map((wall, index) => {
    const [col1, col2, col3] = wall.manualRuns;
    return {
      id: wall.id,
      number: index + 1,
      lengthMm: wall.lengthMm,
      shutters: runFromCuts(col1 ?? []),
      rebate: col2 && col2.length > 0 ? [runFromCuts(col2)] : [],
      ...(col3 && col3.length > 0 ? { extra: runFromCuts(col3) } : {}),
      isOverridden: false,
      polystyreneAuto: false,
      warnings: [],
      notes: wall.notes
    };
  });
  return {
    walls,
    perimeterMm: data.walls.reduce((acc, w) => acc + w.lengthMm, 0),
    tallies: {
      shutters: tallyRuns(
        walls.map((w) => w.shutters),
        rules
      ),
      rebate: tallyRuns(
        walls.flatMap((w) => w.rebate),
        rules
      ),
      ...(data.manualThirdColumn || walls.some((w) => w.extra)
        ? {
            extra: tallyRuns(
              walls.flatMap((w) => (w.extra ? [w.extra] : [])),
              rules
            )
          }
        : {})
    }
  };
};

export const computeJobSheet = (
  data: JobSheetData,
  rules: JobSheetRules
): ComputedSheet => {
  if (data.mode === 'manual') return computeManualSheet(data, rules);
  const sourceWalls = data.rebatesEnabled
    ? data.walls
    : data.walls.map((wall) => ({ ...wall, hasRebate: false }));
  const walls = sourceWalls.map((wall, index) =>
    computeWall(wall, index, rules, {
      prev: sourceWalls[(index - 1 + sourceWalls.length) % sourceWalls.length],
      next: sourceWalls[(index + 1) % sourceWalls.length],
      isFirst: index === 0,
      isLast: index === sourceWalls.length - 1
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
