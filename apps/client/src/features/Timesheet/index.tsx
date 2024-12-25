import { Button } from 'components/Button';
import { TimesheetWeek } from './components/Week';
import { useTimesheet } from './hooks/useTimesheet';

export const Timesheet = () => {
  const { changeDate } = useTimesheet();

  return (
    <div>
      <h1>Timesheet Form</h1>
      <Button onClick={() => changeDate('20/05/2024')}>Change Date</Button>
      <TimesheetWeek />
    </div>
  );
};
