import {
  formatCompoundLength,
  parseCompoundLength
} from '@dreams-built/shared/src/jobsheet/engine/compound';
import { type Wall } from '@dreams-built/shared/src/jobsheet/types';
import { useState } from 'react';

/** Canonical display form of a wall measurement (compound when it has insets). */
export const canonicalLengthOf = (wall: Wall): string =>
  wall.hasRebate && wall.rebateInsets.some((inset) => inset.widthMm > 0)
    ? formatCompoundLength(wall.lengthMm, wall.rebateInsets)
    : `${wall.lengthMm === 0 ? '' : wall.lengthMm}`;

/**
 * Shared behaviour of the measurement field (desktop row and mobile editor):
 * accepts compound notation — `4200/810b` = 4200 bare then 810 of brick
 * (b or r) — which sets the length AND the rebate insets in one go. While
 * the field is focused the raw text is kept; on blur it reverts to the
 * canonical form derived from state.
 */
export const useWallLengthField = (
  wall: Wall,
  patch: (fields: Partial<Wall>) => void
) => {
  const [draft, setDraft] = useState<string | null>(null);

  const onChange = (raw: string) => {
    setDraft(raw);
    if (raw.trim() === '') {
      patch({ lengthMm: 0, rebateInsets: [] });
      return;
    }
    const parsed = parseCompoundLength(raw);
    // Mid-typing states ("4200/") just don't dispatch yet.
    if (!parsed) return;
    patch({
      lengthMm: parsed.lengthMm,
      rebateInsets: parsed.rebateInsets,
      ...(parsed.hasBrick && { hasRebate: true })
    });
  };

  return {
    value: draft ?? canonicalLengthOf(wall),
    onChange,
    onBlur: () => setDraft(null)
  };
};
