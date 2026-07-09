/**
 * Compound measurement notation for partial-rebate walls.
 *
 * A wall can be typed as slash-separated segments, each a length in mm
 * with a `b` (or `r`) suffix on the brick-rebate portions:
 *
 *   `4200/810b`       — 4200 bare (inset to the frame line), then 810 brick
 *   `3600b/2500/300b` — brick, bare, brick
 *   `11610/1960`      — no suffixes: plain arithmetic, total 13570
 *
 * The total becomes the wall length and the bare segments become the
 * wall's rebate insets; a plain number (or all-bare sum) clears the
 * segmentation. `formatCompoundLength` is the inverse, so the measurement
 * field can round-trip the notation from stored state.
 */

import type { RebateInset } from '../types';

export type CompoundSegment = { lengthMm: number; brick: boolean };

export type ParsedCompound = {
  lengthMm: number;
  segments: CompoundSegment[];
  /** True when any segment carries the b/r brick suffix. */
  hasBrick: boolean;
  /** Bare segments as rebate insets (empty for plain/all-brick input). */
  rebateInsets: RebateInset[];
};

const SEGMENT_PATTERN = /^(\d+)\s*([brBR])?$/;

/** Bare segments become insets; adjacent bare segments merge into one span. */
const insetsFromSegments = (segments: CompoundSegment[]): RebateInset[] => {
  const insets: RebateInset[] = [];
  let cursor = 0;
  for (const segment of segments) {
    if (!segment.brick && segment.lengthMm > 0) {
      const last = insets[insets.length - 1];
      if (last && last.offsetFromStartMm + last.widthMm === cursor) {
        last.widthMm += segment.lengthMm;
      } else {
        insets.push({ offsetFromStartMm: cursor, widthMm: segment.lengthMm });
      }
    }
    cursor += segment.lengthMm;
  }
  return insets;
};

/**
 * Parse a measurement entry. Returns null when the string isn't a valid
 * measurement (mid-typing states like `4200/` included) — never throws.
 */
export const parseCompoundLength = (raw: string): ParsedCompound | null => {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const segments: CompoundSegment[] = [];
  for (const part of trimmed.split('/')) {
    const match = SEGMENT_PATTERN.exec(part.trim());
    if (!match) return null;
    segments.push({ lengthMm: Number(match[1]), brick: match[2] !== undefined });
  }

  const hasBrick = segments.some((segment) => segment.brick);
  return {
    lengthMm: segments.reduce((acc, segment) => acc + segment.lengthMm, 0),
    segments,
    hasBrick,
    // Without any brick suffix the slashes are just arithmetic — no
    // segmentation is implied, so no insets.
    rebateInsets: hasBrick ? insetsFromSegments(segments) : []
  };
};

/**
 * Render stored state back into the notation: bare insets unsuffixed,
 * brick stretches with `b`. Walls without insets render as a plain number.
 */
export const formatCompoundLength = (
  lengthMm: number,
  rebateInsets: RebateInset[]
): string => {
  const spans = rebateInsets
    .filter((inset) => inset.widthMm > 0)
    .map((inset) => ({
      from: Math.max(0, inset.offsetFromStartMm),
      to: Math.min(lengthMm, inset.offsetFromStartMm + inset.widthMm)
    }))
    .filter((span) => span.to > span.from)
    .sort((a, b) => a.from - b.from);
  if (spans.length === 0) return String(lengthMm);

  const parts: string[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.from > cursor) parts.push(`${span.from - cursor}b`);
    if (span.from >= cursor) parts.push(String(span.to - span.from));
    cursor = Math.max(cursor, span.to);
  }
  if (cursor < lengthMm) parts.push(`${lengthMm - cursor}b`);
  return parts.join('/');
};
