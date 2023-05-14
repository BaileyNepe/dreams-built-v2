import { useDispatch, useSelector } from '@/components/store';
import { ordinal } from '@/components/utils/helpers';
import { DateTime } from 'luxon';

const generateWeekArray = (weekStart: DateTime) =>
  Array.from({ length: 7 }, (_, i) => {
    const dateFormat = DateTime.fromFormat(weekStart, 'dd/MM/yyyy').plus({ days: i });
    const day = dateFormat.toFormat('d');

    return {
      day: dateFormat.toFormat('EEEE'),
      date: day,
      // TODO fix this
      ordinal: ordinal(day as unknown as number),
      month: dateFormat.toFormat('MMMM'),
    };
  });

const TimesheetWeek = ({ weekStart }: { weekStart: DateTime }) => {
  const dispatch = useDispatch();
  const timesheetEntries = useSelector((state) => state.timesheet);
  const { loading, error, dayEntries, comments } = timesheetEntries;
  const weekArray = generateWeekArray(weekStart);

  return (
    <>
      {weekArray.map((day) => (
        <TimesheetDay
          key={day.date}
          day={day.day}
          date={day.date}
          ordinal={day.ordinal}
          month={day.month}
        />
      ))}
    </>
  );
};

export default TimesheetWeek;
