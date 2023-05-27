import { type DateTime } from 'luxon';

export const getOrdinal = (number: number) => {
  const superScript = ['th', 'st', 'nd', 'rd'];
  return superScript[(number - 20) % 10] || superScript[number] || superScript[0];
};

export const generateWeeks = (
  startWeekInit: DateTime,
  weekEndInit: DateTime,
  numberOfPeriods = 4,
) =>
  Array.from({ length: numberOfPeriods }, (_, i) => ({
    weekStart: startWeekInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy'),
    weekEnd: weekEndInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy'),
  }));
