/**
 * Packer for a single straight run of boxing.
 *
 * Used for both the perimeter shutter run on each wall (with optional
 * overhang at the end) and one segment of a brick rebate run (no overhang
 * ever).
 *
 * Trade rules, verified against QS-issued job sheets:
 *   1. Greedy-fill from the largest standard size down while the remainder
 *      is still at least the smallest standard size.
 *   2. Once the remainder drops below the smallest standard size:
 *      a. NO OVERHANG ALLOWED (internal corner end): emit it as a "short"
 *         custom cut.
 *      b. OVERHANG ALLOWED (external corner end): prefer the smallest
 *         piece-count solution:
 *         - First try promoting the last greedy piece to the next bigger
 *           standard size that absorbs both itself and the remainder
 *           (3780 becomes [4200] with 420 overhang rather than [3600, 600]).
 *         - If the last piece is already the largest standard (or no piece
 *           exists yet), add the smallest standard size that covers the
 *           remainder (5010 becomes [4800, 600] with 390 overhang).
 *
 * The promotion is always safe when the size table steps evenly (e.g.
 * 600mm increments): the next bigger standard is within one step of the
 * smaller, so the overhang stays below the smallest standard size. With an
 * irregular user-edited table the pack is still correct, just potentially
 * with a larger overhang — the Rules dialog warns about that.
 */

import type { Cut, JobSheetRules, PackedRun } from '../types';

export type PackOptions = {
  /** Allow overhang past the end of the run (external corner ends). */
  overhangAtEnd: boolean;
  /** Mark a trailing short cut as polystyrene-padded. */
  polystyreneShort?: boolean;
  /** Annotate a trailing short with the corner angle (non-90-degree corners). */
  angleDeg?: number | null;
};

const standardCut = (lengthMm: number): Cut => ({
  kind: 'standard',
  lengthMm,
  polystyrene: false
});

const shortCut = (lengthMm: number, options: PackOptions): Cut => ({
  kind: 'short',
  lengthMm,
  polystyrene: options.polystyreneShort ?? false,
  ...(options.angleDeg ? { angleDeg: options.angleDeg } : {})
});

/** Standard sizes largest-first — the natural traversal for greedy packing. */
export const sizesDescending = (rules: JobSheetRules): number[] =>
  [...rules.standardSizesMm].sort((a, b) => b - a);

/** Smallest standard size; anything shorter is a short custom cut. */
export const smallestSize = (rules: JobSheetRules): number =>
  Math.min(...rules.standardSizesMm);

/**
 * Pack `lengthMm` into cuts. `lengthMm = 0` is valid and returns an empty
 * run: blank rows and fully-consumed rebate segments round-trip cleanly.
 */
export const packRun = (
  lengthMm: number,
  options: PackOptions,
  rules: JobSheetRules
): PackedRun => {
  if (lengthMm < 0) {
    throw new Error(`Cannot pack negative length: ${lengthMm}`);
  }
  if (lengthMm === 0) {
    return { effectiveLengthMm: 0, cuts: [], overhangMm: 0 };
  }

  const sizes = sizesDescending(rules);
  const smallest = smallestSize(rules);

  const cuts: Cut[] = [];
  let remaining = lengthMm;

  while (remaining >= smallest) {
    let next: number | undefined;
    for (const size of sizes) {
      if (size <= remaining) {
        next = size;
        break;
      }
    }
    if (next === undefined) break;
    cuts.push(standardCut(next));
    remaining -= next;
  }

  if (remaining === 0) {
    return { effectiveLengthMm: lengthMm, cuts, overhangMm: 0 };
  }

  if (!options.overhangAtEnd) {
    cuts.push(shortCut(remaining, options));
    return { effectiveLengthMm: lengthMm, cuts, overhangMm: 0 };
  }

  // Overhang allowed: promote the last greedy piece to the next bigger
  // standard that swallows the remainder along with it. Keeps the piece
  // count flat and produces a single tail overhang.
  const last = cuts[cuts.length - 1];
  if (last) {
    const target = last.lengthMm + remaining;
    const promoted = [...sizes]
      .reverse()
      .find((size) => size >= target && size > last.lengthMm);
    if (promoted !== undefined) {
      cuts[cuts.length - 1] = standardCut(promoted);
      return {
        effectiveLengthMm: lengthMm,
        cuts,
        overhangMm: promoted - target
      };
    }
  }

  // No promotion possible (no greedy piece yet, or the last piece is already
  // the largest standard). Add the smallest standard that covers the rest.
  const cover = [...sizes].reverse().find((size) => size >= remaining);
  if (cover === undefined) {
    // Unreachable while `remaining < smallest`, but fall back to a short so
    // the run still balances if the size table is ever shrunk mid-flight.
    cuts.push(shortCut(remaining, options));
    return { effectiveLengthMm: lengthMm, cuts, overhangMm: 0 };
  }
  cuts.push(standardCut(cover));
  return { effectiveLengthMm: lengthMm, cuts, overhangMm: cover - remaining };
};
