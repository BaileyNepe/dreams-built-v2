/**
 * Render cuts the way the trade writes them on the paper sheet:
 * standard sizes as bare numbers ("4800"), shorts as bare measurements
 * ("290"), polystyrene shorts with a "p" suffix ("355p"), BLK insets as
 * "BLK", and angled shorts with the corner angle ("420 @45°").
 *
 * Shared by the editor chips, the print view, and snapshot diff labels so
 * every surface reads identically.
 */

import type { Cut, PackedRun } from '../types';

export const formatCut = (cut: Cut): string => {
  if (cut.kind === 'blk') return 'BLK';
  const suffix = cut.kind === 'short' && cut.polystyrene ? 'p' : '';
  const angle =
    cut.kind === 'short' && cut.angleDeg !== undefined ? ` @${cut.angleDeg}°` : '';
  return `${cut.lengthMm}${suffix}${angle}`;
};

export const formatCuts = (cuts: readonly Cut[]): string =>
  cuts.map(formatCut).join(' ');

export const formatRun = (run: PackedRun): string => formatCuts(run.cuts);

/** A wall's rebate cell: "-" when no rebate, segments joined with " | ". */
export const formatRebateRuns = (runs: readonly PackedRun[]): string =>
  runs.length === 0 ? '-' : runs.map(formatRun).join(' | ');
