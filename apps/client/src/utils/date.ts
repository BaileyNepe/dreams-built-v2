// TODO move this to a date util file
import { DateTime } from 'luxon';
import { isNumber } from './number';

export const getOrdinal = (number: number) => {
  const superScript = ['th', 'st', 'nd', 'rd'];
  return superScript[(number - 20) % 10] ?? superScript[number] ?? superScript[0] ?? '';
};

export const generateWeeks = (
  startWeekInit: DateTime,
  weekEndInit: DateTime,
  // If the number is negative the weeks will be generated in the future
  numberOfPeriods = 4
) =>
  Array.from({ length: numberOfPeriods }, (_, i) => ({
    weekStart: startWeekInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy'),
    weekEnd: weekEndInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy')
  }));

export const generateWeekArray = (weekStart: string) =>
  Array.from({ length: 7 }, (_, i) => {
    const dateFormat = DateTime.fromFormat(weekStart, 'dd/MM/yyyy').plus({
      days: i
    });
    const date = dateFormat.toFormat('d');
    const day = dateFormat.toFormat('EEEE');
    const month = dateFormat.toFormat('LLLL');
    const ordinal = getOrdinal(parseInt(date));

    return {
      day,
      date,
      ordinal,
      month
    };
  });

export const getWeekStart = (date?: string) => {
  const weekStart = date ? DateTime.fromFormat(date, 'dd/MM/yyyy') : DateTime.now();
  return weekStart.startOf('week').toFormat('dd/MM/yyyy');
};

export const calculateTimeDifference = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) {
    return {
      time: '00:00',
      durationInHours: 0
    };
  }

  const start = DateTime.fromFormat(startTime, 'HH:mm');
  const end = DateTime.fromFormat(endTime, 'HH:mm');
  const diff = end.diff(start, 'hours');

  if (diff.hours < 0) {
    return {
      time: '00:00',
      durationInHours: 0
    };
  }

  return {
    time: diff.toFormat('hh:mm'),
    durationInHours: isNumber(diff.hours) ? diff.hours.toFixed(2) : 0
  };
};
