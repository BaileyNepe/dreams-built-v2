/**
 * Domain model for the ProBase foundation job sheet.
 *
 * Everything is dimensioned in millimetres. Wall ordering follows the trade
 * convention: the first wall in the list is the wall containing the garage
 * door, then walls proceed clockwise around the foundation perimeter. Wall
 * numbers (1-based) are derived from array order and never stored.
 *
 * The persisted document (`JobSheetData`) holds only what the user authored;
 * cut lists and tallies are recomputed from it by the pure engine using the
 * sheet's own frozen copy of `JobSheetRules`, so a sheet always re-renders
 * exactly as it was saved even if the global rules change later.
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Rules (user-editable, no deploy needed)                              */
/* ------------------------------------------------------------------ */

export const jobSheetRulesSchema = z.object({
  /** Standard cut lengths in mm. Order does not matter; the engine sorts. */
  standardSizesMm: z.array(z.number().int().positive()).min(1),
  /** Thickness of the shutter board consumed at an absorbing internal corner. */
  shutterThicknessMm: z.number().int().positive(),
  /** Brick rebate width subtracted where a perpendicular brick face crosses. */
  rebateWidthMm: z.number().int().positive(),
  /** Length of a BLK inset piece (a rebate-width x shutter-thickness block). */
  blkLengthMm: z.number().int().positive(),
  /** Auto-flag shorts as polystyrene-padded when both wall ends are internal. */
  autoPolystyreneWhenBothEndsInternal: z.boolean()
});
export type JobSheetRules = z.infer<typeof jobSheetRulesSchema>;

/* ------------------------------------------------------------------ */
/* Walls                                                                */
/* ------------------------------------------------------------------ */

/**
 * External = exposed corner (exterior space wider than the turn); the shutter
 * may overhang past it. Internal = sheltered corner where the foundation
 * turns into itself; no room to overhang, so remainders become short cuts.
 */
export const cornerKindSchema = z.enum(['external', 'internal']);
export type CornerKind = z.infer<typeof cornerKindSchema>;

export const openingKindSchema = z.enum([
  'garage_door',
  'entry_door',
  'sliding_door',
  'stacker',
  'window',
  'other'
]);
export type OpeningKind = z.infer<typeof openingKindSchema>;

/**
 * An opening along a wall. `hasRebate: false` (full-height joinery: garage
 * doors, entry doors, sliders, stackers) splits the brick rebate run into
 * segments around the opening.
 */
export const openingSchema = z.object({
  kind: openingKindSchema,
  widthMm: z.number().int().positive(),
  /** Measured from the wall's start corner (shared with the previous wall). */
  offsetFromStartMm: z.number().int().nonnegative(),
  hasRebate: z.boolean(),
  label: z.string().optional()
});
export type Opening = z.infer<typeof openingSchema>;

/** A single piece in a packed run. */
export const cutSchema = z.object({
  kind: z.enum(['standard', 'short', 'blk']),
  lengthMm: z.number().int().positive(),
  /** Polystyrene padding, rendered as a "p" suffix. Only meaningful on shorts. */
  polystyrene: z.boolean().default(false),
  /** Corner angle annotation for shorts cut at non-90-degree corners. */
  angleDeg: z.number().optional()
});
export type Cut = z.infer<typeof cutSchema>;

/**
 * A manual override of a wall's computed breakdown. When present, the engine
 * uses these cut lists verbatim and never recomputes them until the override
 * is removed ("Reset to computed").
 */
export const wallOverrideSchema = z.object({
  shutterCuts: z.array(cutSchema),
  /** Segment structure preserved: one inner array per rebate sub-run. */
  rebateRuns: z.array(z.array(cutSchema)),
  note: z.string().default('')
});
export type WallOverride = z.infer<typeof wallOverrideSchema>;

export const wallSchema = z.object({
  /** Stable id (cuid2) used for drag-reorder keys and snapshot diffing. */
  id: z.string(),
  /**
   * Raw perimeter measurement. 0 means "not entered yet" — a freshly added
   * row must survive an autosave round-trip; the engine packs it as empty.
   */
  lengthMm: z.number().int().nonnegative(),
  cornerStart: cornerKindSchema.default('external'),
  cornerEnd: cornerKindSchema.default('external'),
  /**
   * At an internal corner the perpendicular wall's shutter sits inside the
   * foundation and eats one shutter thickness off this wall's run. Only one
   * of the two walls meeting at the corner absorbs it — the user picks which.
   */
  absorbShutterAtStart: z.boolean().default(false),
  absorbShutterAtEnd: z.boolean().default(false),
  /** False for walls with no brick veneer (e.g. garage walls): rebate row is "-". */
  hasRebate: z.boolean().default(true),
  /** Subtract the rebate width where a perpendicular brick face crosses. */
  rebateOffsetAtStart: z.boolean().default(false),
  rebateOffsetAtEnd: z.boolean().default(false),
  /** Emit a BLK inset piece where rebate coverage starts/stops mid-wall. */
  blkAtStart: z.boolean().default(false),
  blkAtEnd: z.boolean().default(false),
  openings: z.array(openingSchema).default([]),
  /** null = automatic (from the both-ends-internal rule); true/false = forced. */
  polystyreneOverride: z.boolean().nullable().default(null),
  /** Corner angle when the wall meets its neighbour at other than 90 degrees. */
  angledCornerDeg: z.number().nullable().default(null),
  isGarageDoorWall: z.boolean().default(false),
  notes: z.string().default(''),
  override: wallOverrideSchema.nullable().default(null)
});
export type Wall = z.infer<typeof wallSchema>;

/* ------------------------------------------------------------------ */
/* Simple item sections (Joinery / Shower Boxes / Garage)               */
/* ------------------------------------------------------------------ */

export const sheetItemSchema = z.object({
  id: z.string(),
  /** Free text. Empty is allowed so a just-added row survives autosave. */
  text: z.string(),
  qty: z.number().int().positive().nullable().default(null)
});
export type SheetItem = z.infer<typeof sheetItemSchema>;

/* ------------------------------------------------------------------ */
/* The persisted sheet document                                         */
/* ------------------------------------------------------------------ */

export const jobSheetDataSchema = z.object({
  /** Foundation system as written on the sheet, e.g. "PROBASE". */
  system: z.string().default('PROBASE'),
  /** Array order IS the wall numbering: garage-door wall first, clockwise. */
  walls: z.array(wallSchema).default([]),
  joinery: z.array(sheetItemSchema).default([]),
  showerBoxes: z.array(sheetItemSchema).default([]),
  garage: z.array(sheetItemSchema).default([]),
  notes: z.string().default('')
});
export type JobSheetData = z.infer<typeof jobSheetDataSchema>;

/* ------------------------------------------------------------------ */
/* Computed output (derived by the engine, never persisted on the sheet)*/
/* ------------------------------------------------------------------ */

/** A packed run: one wall's shutters, or one rebate sub-segment. */
export type PackedRun = {
  /** Length the run had to cover after corner/offset adjustments. */
  effectiveLengthMm: number;
  cuts: Cut[];
  /** Total mm the last piece overhangs past the wall end (0 if exact). */
  overhangMm: number;
};

export type ComputedWall = {
  id: string;
  /** 1-based, derived from array order. */
  number: number;
  lengthMm: number;
  shutters: PackedRun;
  /** One entry per rebate sub-segment; empty renders as "-". */
  rebate: PackedRun[];
  isOverridden: boolean;
  /** What the both-ends-internal rule says, before any manual override. */
  polystyreneAuto: boolean;
  /** Non-fatal problems, e.g. absorb allowances exceeding the wall length. */
  warnings: string[];
  notes: string;
};

/** Counts keyed by standard size (as a string) plus 'shorts' and 'blk'. */
export type Tally = Record<string, number>;

export type ComputedSheet = {
  walls: ComputedWall[];
  perimeterMm: number;
  tallies: { shutters: Tally; rebate: Tally };
};

/* ------------------------------------------------------------------ */
/* Snapshots                                                            */
/* ------------------------------------------------------------------ */

/**
 * A snapshot is fully self-describing: the authored data, the rules that
 * were active on the sheet, and the computed output those two produced at
 * the time it was taken.
 */
export const snapshotBlobSchema = z.object({
  data: jobSheetDataSchema,
  rules: jobSheetRulesSchema,
  computed: z.unknown()
});
export type SnapshotBlob = z.infer<typeof snapshotBlobSchema>;
