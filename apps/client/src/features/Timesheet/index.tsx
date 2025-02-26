import { Container } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import { TimesheetWeek } from './components/Week';
import { useTimesheet } from './hooks/useTimesheet';

export const Timesheet = () => {
  const { changeDate, weekStart } = useTimesheet();

  return (
    <Container>
      <BasicDatePicker value={weekStart} onChange={changeDate} />
      <TimesheetWeek />
    </Container>
  );
};
