import { getOrdinal } from '@/components/utils/helpers';
import { DateTime } from 'luxon';
import TimesheetDay from './day';

const generateWeekArray = (weekStart: string) =>
  Array.from({ length: 7 }, (_, i) => {
    const dateFormat = DateTime.fromFormat(weekStart, 'dd/MM/yyyy').plus({ days: i });
    const day = dateFormat.toFormat('d');

    return {
      day: dateFormat.toFormat('EEEE'),
      date: day,
      ordinal: getOrdinal(Number(day)),
      month: dateFormat.toFormat('MMMM'),
    };
  });

const TimesheetWeek = ({ weekStart }: { weekStart: string }) => {
  const weekArray = generateWeekArray(weekStart);

  return (
    <>
      {weekArray.map(({ day, date, ordinal, month }) => (
        <TimesheetDay key={date} day={day} date={date} ordinal={ordinal} month={month} />
      ))}
    </>
  );
};

export default TimesheetWeek;
