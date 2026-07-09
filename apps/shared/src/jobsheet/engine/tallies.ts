/**
 * Aggregate counts of cuts by length for the bottom-of-sheet tally tables,
 * separated for shutters and rebate.
 *
 * Keys are the rule set's standard sizes (as strings) plus 'shorts' and
 * 'blk' — dynamic because the size list is user-editable data.
 */

import type { JobSheetRules, PackedRun, Tally } from '../types';
import { sizesDescending } from './packRun';

export const SHORTS_KEY = 'shorts';
export const BLK_KEY = 'blk';

export const emptyTally = (rules: JobSheetRules): Tally => {
  const tally: Tally = {};
  for (const size of sizesDescending(rules)) {
    tally[String(size)] = 0;
  }
  tally[SHORTS_KEY] = 0;
  tally[BLK_KEY] = 0;
  return tally;
};

/** Tally a list of packed runs (all of a section's walls / rebate segments). */
export const tallyRuns = (runs: readonly PackedRun[], rules: JobSheetRules): Tally => {
  const tally = emptyTally(rules);
  const standardKeys = new Set(rules.standardSizesMm.map(String));

  for (const run of runs) {
    for (const cut of run.cuts) {
      if (cut.kind === 'blk') {
        tally[BLK_KEY] += 1;
      } else if (cut.kind === 'short') {
        tally[SHORTS_KEY] += 1;
      } else if (standardKeys.has(String(cut.lengthMm))) {
        tally[String(cut.lengthMm)] += 1;
      } else {
        // Defensive: a standard cut with a non-standard length (e.g. after
        // the size table was edited) counts as a short rather than vanishing.
        tally[SHORTS_KEY] += 1;
      }
    }
  }
  return tally;
};
