import type { JobSheetRules } from './types';

/**
 * Seed rules used when no JobSheetRules row exists yet. Every value here is
 * editable in-app (Rules dialog); these are just first-run defaults.
 *
 * TODO(bailey): confirm every value below against the real trade numbers
 * before the crew relies on a sheet — especially the BLK length and whether
 * the polystyrene auto-rule matches how the QS actually flags pads.
 */
export const DEFAULT_JOBSHEET_RULES: JobSheetRules = {
  // TODO(bailey): confirm the standard size set (does it ever differ per client?)
  standardSizesMm: [4800, 4200, 3600, 3000, 2400, 1800, 1200, 600],
  // TODO(bailey): confirm shutter board thickness (65mm per the prototype)
  shutterThicknessMm: 65,
  // TODO(bailey): confirm brick rebate width (120mm per the prototype)
  rebateWidthMm: 120,
  // TODO(bailey): confirm BLK inset length (BLK described as a 120x65 shutter)
  blkLengthMm: 120,
  // TODO(bailey): confirm polystyrene is wanted automatically on both-ends-internal walls
  autoPolystyreneWhenBothEndsInternal: true
};
