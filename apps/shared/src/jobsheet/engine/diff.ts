/**
 * Compare two sheet snapshots (or a snapshot against the live sheet).
 *
 * Both sides are recomputed from their own `data` + `rules` rather than
 * trusting the stored `computed` blob — recomputation is deterministic and
 * keeps the diff typed even if the blob predates an engine change.
 *
 * Walls are matched by their stable id, so a reordered wall diffs as a
 * position change rather than a remove + add.
 */

import type { ComputedWall, SnapshotBlob, Tally } from '../types';
import { computeJobSheet } from './computeSheet';
import { formatCuts, formatRebateRuns } from './format';

export type WallSummary = {
  number: number;
  lengthMm: number;
  shutters: string;
  rebate: string;
  notes: string;
};

export type WallDiffEntry = {
  id: string;
  status: 'added' | 'removed' | 'changed';
  before?: WallSummary;
  after?: WallSummary;
  changedFields: string[];
};

export type ItemsDiff = {
  added: string[];
  removed: string[];
  changed: string[];
};

export type SheetDiff = {
  walls: WallDiffEntry[];
  /** Non-zero tally deltas (after minus before), per section. */
  tallies: { shutters: Record<string, number>; rebate: Record<string, number> };
  items: Record<'joinery' | 'showerBoxes' | 'garage', ItemsDiff>;
  /** True when nothing differs at all. */
  isEmpty: boolean;
};

const summarise = (wall: ComputedWall): WallSummary => ({
  number: wall.number,
  lengthMm: wall.lengthMm,
  shutters: formatCuts(wall.shutters.cuts),
  rebate: formatRebateRuns(wall.rebate),
  notes: wall.notes
});

const changedFieldsBetween = (before: WallSummary, after: WallSummary): string[] => {
  const fields: string[] = [];
  if (before.lengthMm !== after.lengthMm) fields.push('measurement');
  if (before.shutters !== after.shutters) fields.push('shutters');
  if (before.rebate !== after.rebate) fields.push('rebate');
  if (before.notes !== after.notes) fields.push('notes');
  if (before.number !== after.number) fields.push('position');
  return fields;
};

const diffTallies = (before: Tally, after: Tally): Record<string, number> => {
  const deltas: Record<string, number> = {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const delta = (after[key] ?? 0) - (before[key] ?? 0);
    if (delta !== 0) deltas[key] = delta;
  }
  return deltas;
};

type Item = { id: string; text: string; qty: number | null };

const labelOf = (item: Item): string =>
  item.qty !== null ? `${item.text} ×${item.qty}` : item.text;

const diffItems = (before: Item[], after: Item[]): ItemsDiff => {
  const beforeById = new Map(before.map((i) => [i.id, i]));
  const afterById = new Map(after.map((i) => [i.id, i]));
  const added = after.filter((i) => !beforeById.has(i.id)).map(labelOf);
  const removed = before.filter((i) => !afterById.has(i.id)).map(labelOf);
  const changed = after
    .filter((i) => {
      const prev = beforeById.get(i.id);
      return prev !== undefined && (prev.text !== i.text || prev.qty !== i.qty);
    })
    .map((i) => `${labelOf(beforeById.get(i.id) as Item)} → ${labelOf(i)}`);
  return { added, removed, changed };
};

export const diffSheets = (before: SnapshotBlob, after: SnapshotBlob): SheetDiff => {
  const beforeSheet = computeJobSheet(before.data, before.rules);
  const afterSheet = computeJobSheet(after.data, after.rules);

  const beforeById = new Map(beforeSheet.walls.map((w) => [w.id, summarise(w)]));
  const afterById = new Map(afterSheet.walls.map((w) => [w.id, summarise(w)]));

  const walls: WallDiffEntry[] = [];
  for (const [id, summary] of beforeById) {
    if (!afterById.has(id)) {
      walls.push({ id, status: 'removed', before: summary, changedFields: [] });
    }
  }
  for (const [id, summary] of afterById) {
    const prev = beforeById.get(id);
    if (!prev) {
      walls.push({ id, status: 'added', after: summary, changedFields: [] });
    } else {
      const changedFields = changedFieldsBetween(prev, summary);
      if (changedFields.length > 0) {
        walls.push({
          id,
          status: 'changed',
          before: prev,
          after: summary,
          changedFields
        });
      }
    }
  }
  walls.sort((a, b) => (a.after ?? a.before)!.number - (b.after ?? b.before)!.number);

  const tallies = {
    shutters: diffTallies(beforeSheet.tallies.shutters, afterSheet.tallies.shutters),
    rebate: diffTallies(beforeSheet.tallies.rebate, afterSheet.tallies.rebate)
  };

  const items = {
    joinery: diffItems(before.data.joinery, after.data.joinery),
    showerBoxes: diffItems(before.data.showerBoxes, after.data.showerBoxes),
    garage: diffItems(before.data.garage, after.data.garage)
  };

  const isEmpty =
    walls.length === 0 &&
    Object.keys(tallies.shutters).length === 0 &&
    Object.keys(tallies.rebate).length === 0 &&
    Object.values(items).every(
      (d) => d.added.length === 0 && d.removed.length === 0 && d.changed.length === 0
    );

  return { walls, tallies, items, isEmpty };
};
