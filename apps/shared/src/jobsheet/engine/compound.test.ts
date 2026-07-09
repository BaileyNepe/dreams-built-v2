/**
 * Compound measurement notation: `4200/810b` typed into the measurement
 * field sets the wall length AND the rebate insets (bare = inset to the
 * frame line, b/r suffix = brick rebate stretch).
 */

import { describe, expect, it } from 'bun:test';

import { formatCompoundLength, parseCompoundLength } from './compound';

describe('parseCompoundLength', () => {
  it('parses bare-then-brick (no brick at the start, brick at the end)', () => {
    expect(parseCompoundLength('4200/810b')).toEqual({
      lengthMm: 5010,
      segments: [
        { lengthMm: 4200, brick: false },
        { lengthMm: 810, brick: true }
      ],
      hasBrick: true,
      rebateInsets: [{ offsetFromStartMm: 0, widthMm: 4200 }]
    });
  });

  it('parses brick/bare/brick', () => {
    const parsed = parseCompoundLength('3600b/2500/300b');
    expect(parsed?.lengthMm).toBe(6400);
    expect(parsed?.rebateInsets).toEqual([{ offsetFromStartMm: 3600, widthMm: 2500 }]);
  });

  it('accepts r as the brick suffix and is case-insensitive', () => {
    expect(parseCompoundLength('3600R/2500/300B')?.rebateInsets).toEqual([
      { offsetFromStartMm: 3600, widthMm: 2500 }
    ]);
  });

  it('treats a suffix-free compound as plain arithmetic (paper-sheet sums)', () => {
    expect(parseCompoundLength('11610/1960')).toMatchObject({
      lengthMm: 13570,
      hasBrick: false,
      rebateInsets: []
    });
  });

  it('parses a plain number and an all-brick wall without insets', () => {
    expect(parseCompoundLength('6000')).toMatchObject({
      lengthMm: 6000,
      hasBrick: false,
      rebateInsets: []
    });
    expect(parseCompoundLength('6000b')).toMatchObject({
      lengthMm: 6000,
      hasBrick: true,
      rebateInsets: []
    });
  });

  it('merges adjacent bare segments into one inset', () => {
    expect(parseCompoundLength('1200/800/4000b')?.rebateInsets).toEqual([
      { offsetFromStartMm: 0, widthMm: 2000 }
    ]);
  });

  it('tolerates whitespace around segments', () => {
    expect(parseCompoundLength(' 4200 / 810b ')?.lengthMm).toBe(5010);
  });

  it('returns null for mid-typing and invalid input', () => {
    expect(parseCompoundLength('')).toBeNull();
    expect(parseCompoundLength('4200/')).toBeNull();
    expect(parseCompoundLength('/810b')).toBeNull();
    expect(parseCompoundLength('abc')).toBeNull();
    expect(parseCompoundLength('4200x/810b')).toBeNull();
    expect(parseCompoundLength('4200b810')).toBeNull();
  });
});

describe('formatCompoundLength', () => {
  it('round-trips the notation from stored state', () => {
    for (const input of ['4200/810b', '3600b/2500/300b', '1800b/2400/1800b']) {
      const parsed = parseCompoundLength(input);
      expect(parsed).not.toBeNull();
      expect(formatCompoundLength(parsed!.lengthMm, parsed!.rebateInsets)).toBe(
        input
      );
    }
  });

  it('renders a wall without insets as a plain number', () => {
    expect(formatCompoundLength(6000, [])).toBe('6000');
    expect(formatCompoundLength(6000, [{ offsetFromStartMm: 0, widthMm: 0 }])).toBe(
      '6000'
    );
  });

  it('clips insets that run past the wall end', () => {
    expect(
      formatCompoundLength(6000, [{ offsetFromStartMm: 3600, widthMm: 99999 }])
    ).toBe('3600b/2400');
  });
});
