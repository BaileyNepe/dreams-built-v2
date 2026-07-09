/**
 * Brick rebate packer for one wall.
 *
 * The rebate strip follows the perimeter inside the shutter and is broken
 * by non-rebated openings. At corners the strips joint like boards: at an
 * external corner one strip runs through and the other is shortened by one
 * rebate width (−120); at an internal corner one strip EXTENDS one rebate
 * width past the wall end to fill the corner square. Which wall does what
 * is resolved by computeSheet (auto by corner kind, overridable).
 *
 * Where an opening breaks the run mid-wall with `blk` set, the channel
 * ends are capped with BLK insets and the adjacent pieces may overhang to
 * the cap (the BLK sits wherever they finish), so those segment ends pack
 * with overhang instead of an exact short.
 */

import type { JobSheetRules, PackedRun, Wall } from '../types';
import { packRun } from './packRun';

/** The wall-end adjustments after auto/override resolution. */
export type ResolvedRebateEnds = {
  offsetAtStart: boolean;
  offsetAtEnd: boolean;
  extendAtStart: boolean;
  extendAtEnd: boolean;
};

export type RebateSegment = {
  startMm: number;
  endMm: number;
  blkAtStart: boolean;
  blkAtEnd: boolean;
};

/** Where along the wall the rebate runs sit — also used by the floor-plan visual. */
export const computeRebateSegments = (
  wall: Wall,
  rules: JobSheetRules,
  ends: ResolvedRebateEnds
): RebateSegment[] => {
  const width = rules.rebateWidthMm;
  const start = (ends.offsetAtStart ? width : 0) - (ends.extendAtStart ? width : 0);
  const end =
    wall.lengthMm - (ends.offsetAtEnd ? width : 0) + (ends.extendAtEnd ? width : 0);
  if (end <= start) {
    return [];
  }

  // Breaks: non-rebated openings (joinery — plain splits) and rebate
  // insets (slab-edge steps — BLK-capped), clipped to the run.
  const breaks = [
    ...wall.openings
      .filter((o) => !o.hasRebate)
      .map((o) => ({ from: o.offsetFromStartMm, width: o.widthMm, blk: false })),
    ...wall.rebateInsets.map((inset) => ({
      from: inset.offsetFromStartMm,
      width: inset.widthMm,
      blk: true
    }))
  ]
    .map((b) => ({
      start: Math.max(b.from, start),
      end: Math.min(b.from + b.width, end),
      blk: b.blk
    }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const segments: RebateSegment[] = [];
  let cursor = start;
  let blkPending = false;
  for (const br of breaks) {
    if (br.start > cursor) {
      segments.push({
        startMm: cursor,
        endMm: br.start,
        blkAtStart: blkPending,
        blkAtEnd: br.blk
      });
    }
    if (br.end > cursor) {
      cursor = br.end;
      blkPending = br.blk;
    }
  }
  if (end > cursor) {
    segments.push({
      startMm: cursor,
      endMm: end,
      blkAtStart: blkPending,
      blkAtEnd: false
    });
  }
  return segments;
};

/**
 * Pack the brick rebate for a wall: one `PackedRun` per sub-segment. The
 * rebate NEVER overhangs and never carries BLKs — the strip runs exactly
 * to the brick line; the BLK steps belong to the shutter run.
 */
export const packRebateForWall = (
  wall: Wall,
  rules: JobSheetRules,
  polystyreneShort: boolean,
  ends: ResolvedRebateEnds
): PackedRun[] => {
  if (!wall.hasRebate) return [];

  return computeRebateSegments(wall, rules, ends).map((seg) =>
    packRun(seg.endMm - seg.startMm, { overhangAtEnd: false, polystyreneShort }, rules)
  );
};
