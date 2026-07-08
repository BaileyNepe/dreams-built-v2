/**
 * Brick rebate packer for one wall.
 *
 * The brick rebate is a strip recessed into the inside face of the perimeter
 * shutter where the brick veneer sits. It runs along the wall but is broken
 * by:
 *
 *   - a rebate-width offset (rules.rebateWidthMm) at either end where a
 *     perpendicular wall's brick face crosses this wall's rebate run, and
 *   - any opening on the wall whose `hasRebate` is false (full-height
 *     joinery: garage doors, entry doors, sliders, stackers).
 *
 * The rebate never overhangs at any end — the brick veneer would otherwise
 * stick past the corner. Each sub-segment is packed independently with the
 * same greedy standard-size algorithm as the shutter packer.
 *
 * Walls without brick rebate (`hasRebate: false`) emit an empty array,
 * which renders as "-" on the job sheet.
 */

import type { JobSheetRules, PackedRun, Wall } from '../types';
import { packRun } from './packRun';

type RebateSegment = { startMm: number; endMm: number };

const computeRebateSegments = (wall: Wall, rules: JobSheetRules): RebateSegment[] => {
  const start = wall.rebateOffsetAtStart ? rules.rebateWidthMm : 0;
  const end = wall.lengthMm - (wall.rebateOffsetAtEnd ? rules.rebateWidthMm : 0);
  if (end <= start) {
    return [];
  }

  // Insert breaks for every non-rebated opening, ignoring the parts of an
  // opening that fall outside the rebate offsets.
  const breaks = wall.openings
    .filter((o) => !o.hasRebate)
    .map((o) => ({
      start: Math.max(o.offsetFromStartMm, start),
      end: Math.min(o.offsetFromStartMm + o.widthMm, end)
    }))
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  const segments: RebateSegment[] = [];
  let cursor = start;
  for (const br of breaks) {
    if (br.start > cursor) {
      segments.push({ startMm: cursor, endMm: br.start });
    }
    cursor = Math.max(cursor, br.end);
  }
  if (end > cursor) {
    segments.push({ startMm: cursor, endMm: end });
  }
  return segments;
};

/**
 * Pack the brick rebate for a wall: one `PackedRun` per sub-segment (a wall
 * with a single garage door cuts into two segments; a wall with no openings
 * stays as one).
 *
 * `polystyreneShort` is the wall's resolved polystyrene flag (auto rule or
 * manual override), applied to any short cut in any segment.
 */
export const packRebateForWall = (
  wall: Wall,
  rules: JobSheetRules,
  polystyreneShort: boolean
): PackedRun[] => {
  if (!wall.hasRebate) return [];

  return computeRebateSegments(wall, rules).map((seg) =>
    packRun(
      seg.endMm - seg.startMm,
      { overhangAtEnd: false, polystyreneShort },
      rules
    )
  );
};
