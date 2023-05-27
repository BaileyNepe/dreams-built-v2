import { DateTime } from 'luxon';
import { describe, expect, test } from 'vitest';
import { generateWeeks, getOrdinal } from './helpers';

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
    [20, 'th'],
  ])('ordinal returns %s for input %s', (input, expected) => {
    expect(getOrdinal(input)).toBe(expected);
  });
});

describe('generateWeeks', () => {
  test.each([
    [
      DateTime.local(2023, 5, 27),
      DateTime.local(2023, 6, 2),
      4,
      [
        { weekStart: '27/05/2023', weekEnd: '02/06/2023' },
        { weekStart: '20/05/2023', weekEnd: '26/05/2023' },
        { weekStart: '13/05/2023', weekEnd: '19/05/2023' },
        { weekStart: '06/05/2023', weekEnd: '12/05/2023' },
      ],
    ],
    [
      DateTime.local(2023, 5, 27),
      DateTime.local(2023, 6, 2),
      2,
      [
        { weekStart: '27/05/2023', weekEnd: '02/06/2023' },
        { weekStart: '20/05/2023', weekEnd: '26/05/2023' },
      ],
    ],
    [
      DateTime.local(2023, 5, 27),
      DateTime.local(2023, 6, 2),
      10,
      [
        { weekStart: '27/05/2023', weekEnd: '02/06/2023' },
        { weekStart: '20/05/2023', weekEnd: '26/05/2023' },
        { weekStart: '13/05/2023', weekEnd: '19/05/2023' },
        { weekStart: '06/05/2023', weekEnd: '12/05/2023' },
        { weekStart: '29/04/2023', weekEnd: '05/05/2023' },
        { weekStart: '22/04/2023', weekEnd: '28/04/2023' },
        { weekStart: '15/04/2023', weekEnd: '21/04/2023' },
        { weekStart: '08/04/2023', weekEnd: '14/04/2023' },
        { weekStart: '01/04/2023', weekEnd: '07/04/2023' },
        { weekStart: '25/03/2023', weekEnd: '31/03/2023' },
      ],
    ],
  ])('generateWeeks returns correct periods', (startWeek, endWeek, numberOfPeriods, expected) => {
    expect(generateWeeks(startWeek, endWeek, numberOfPeriods)).toStrictEqual(expected);
  });
});
