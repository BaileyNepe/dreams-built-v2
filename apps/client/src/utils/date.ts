// TODO move this to a date util file
import { DateTime } from 'luxon';

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
      totalMinutes: 0
    };
  }

  const start = DateTime.fromFormat(startTime, 'HH:mm');
  const end = DateTime.fromFormat(endTime, 'HH:mm');
  const diffInMinutes = end.diff(start, 'minutes').as('minutes');

  // If end is before start, treat as zero
  if (diffInMinutes <= 0) {
    return {
      time: '00:00',
      totalMinutes: 0
    };
  }

  // Convert minutes back into HH:mm
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = Math.floor(diffInMinutes % 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;

  return {
    time: timeString,
    totalMinutes: diffInMinutes
  };
};
