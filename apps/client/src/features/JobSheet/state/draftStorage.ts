/**
 * Local draft persistence for offline resilience.
 *
 * Every edit mirrors the sheet document into localStorage. If the browser
 * is refreshed or crashes while saves can't reach the server (internet
 * outage), the provider restores the draft on next load — but only when the
 * draft was based on the revision the server still has, so we never
 * silently overwrite someone else's newer work.
 */

import {
  jobSheetDataSchema,
  type JobSheetData
} from '@dreams-built/shared/src/jobsheet/types';
import { z } from 'zod';

const draftSchema = z.object({
  revision: z.number().int().nonnegative(),
  data: jobSheetDataSchema,
  savedAt: z.string()
});
export type SheetDraft = z.infer<typeof draftSchema>;

const draftKey = (sheetId: string) => `jobsheet:draft:${sheetId}`;

export const readDraft = (sheetId: string): SheetDraft | null => {
  try {
    const raw = window.localStorage.getItem(draftKey(sheetId));
    if (!raw) return null;
    return draftSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const writeDraft = (
  sheetId: string,
  draft: { revision: number; data: JobSheetData }
): void => {
  try {
    window.localStorage.setItem(
      draftKey(sheetId),
      JSON.stringify({ ...draft, savedAt: new Date().toISOString() })
    );
  } catch {
    // Storage full or unavailable — autosave still works, only the
    // refresh-during-outage safety net is lost.
  }
};

export const clearDraft = (sheetId: string): void => {
  try {
    window.localStorage.removeItem(draftKey(sheetId));
  } catch {
    // Ignore.
  }
};
