import { describe, expect, test } from 'vitest';
import { getOrdinal } from './date';

describe('getOrdinal', () => {
  test.each([
    [31, 'st'],
    [1, 'st'],
    [2, 'nd'],
    [3, 'rd'],
    [4, 'th'],
    [11, 'th'],
    [13, 'th'],
    [21, 'st'],
    [22, 'nd'],
    [23, 'rd'],
    [24, 'th'],
    [20, 'th']
  ])('ordinal returns %s for input %s', (input, expected) => {
    expect(getOrdinal(input)).toBe(expected);
  });
});
