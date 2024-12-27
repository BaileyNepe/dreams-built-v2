import { Container, Typography } from '@mui/material';
import { Button } from 'components/Button';
import { TimesheetWeek } from './components/Week';
import { useTimesheet } from './hooks/useTimesheet';

export const Timesheet = () => {
  const { changeDate } = useTimesheet();

  return (
    <Container>
      <Button onClick={() => changeDate('20/05/2024')}>Change Date</Button>
      <TimesheetWeek />
    </Container>
  );
};
