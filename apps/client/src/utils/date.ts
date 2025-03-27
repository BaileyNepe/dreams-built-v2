import { DateTime } from 'luxon';

export const getOrdinal = (number: number) => {
  const superScript = ['th', 'st', 'nd', 'rd'];
  return superScript[(number - 20) % 10] ?? superScript[number] ?? superScript[0] ?? '';
};

type DateFormats =
  | 'yyyy-MM-dd'
  | 'd'
  | 'EEEE'
  | 'LLLL'
  | 'HH:mm'
  | 'HH:mm:ss'
  | 'dd/MM/yyyy'
  | 'd MMM';

export const formatDate = (date: DateTime, format: DateFormats = 'yyyy-MM-dd') =>
  date.toFormat(format);

export const getDate = (date?: string | Date, fromFormat: DateFormats = 'yyyy-MM-dd') => {
  if (date instanceof Date) {
    return DateTime.fromJSDate(date);
  }
  return date ? DateTime.fromFormat(date, fromFormat) : DateTime.now();
};

export const getEndOfWeek = (date?: string, fromFormat: DateFormats = 'yyyy-MM-dd') =>
  getDate(date, fromFormat).endOf('week');

export const generateWeekArray = (
  weekStart: string,
  fromFormat: DateFormats = 'yyyy-MM-dd'
) =>
  Array.from({ length: 7 }, (_, i) => {
    const dateFormat = DateTime.fromFormat(weekStart, fromFormat).plus({
      days: i
    });
    const date = dateFormat.toFormat('d');
    const day = dateFormat.toFormat('EEEE');
    const month = dateFormat.toFormat('LLLL');
    const ordinal = getOrdinal(parseInt(date));

    return {
      dateFormat,
      day,
      date,
      ordinal,
      month
    };
  });

export const getWeekStart = (date?: string, format: DateFormats = 'yyyy-MM-dd') => {
  const dt = date ? DateTime.fromFormat(date, format) : DateTime.now();
  // Calculate Monday as the start of the week.
  const diff = dt.weekday - 1; // Monday is 1
  return dt.minus({ days: diff }).toFormat(format);
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

export const isWithinRange = (
  date: DateTime,
  min?: DateTime,
  max?: DateTime
): boolean => {
  if (min && date < min) return false;
  if (max && date > max) return false;
  return true;
};

export const isMatchingDate = ({ date1, date2 }: { date1: DateTime; date2: DateTime }) =>
  date1.toFormat('yyyy-MM-dd') === date2.toFormat('yyyy-MM-dd');

export const isMatchingDates = (date: DateTime, dates: DateTime[] | string[]) => {
  if (dates.length) {
    return dates
      .map((d) => (typeof d === 'string' ? DateTime.fromFormat(d, 'yyyy-MM-dd') : d))
      .some((d) => isMatchingDate({ date1: date, date2: d }));
  }

  return false;
};

export const getWeeklyDatePercentage = (date: DateTime) => {
  const startOfWeek = date.startOf('week');

  const totalRange = date.endOf('week').toMillis() - startOfWeek.toMillis();
  const offset = date.toMillis() - startOfWeek.toMillis();
  const pct = (offset / totalRange) * 100;
  return Math.max(0, Math.min(pct, 100));
};
