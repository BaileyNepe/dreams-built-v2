import { DateSelector } from 'components/DateSelector';
import { Suspense, useState, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { TimesheetReport } from './TimesheetReport';

const Container = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem;
`;

export const Report: FC = () => {
  const [currentWeek, setCurrentWeek] = useState(getDate(getWeekStart()));
  const getNextWeek = () => {
    setCurrentWeek((prev) => prev.plus({ weeks: 1 }));
  };
  const getPreviousWeek = () => {
    setCurrentWeek((prev) => prev.minus({ weeks: 1 }));
  };
  const handleDateChange = (date: string) => {
    setCurrentWeek(getDate(getWeekStart(date)));
  };

  return (
    <Container>
      <DateSelector
        value={currentWeek}
        defaultValue={currentWeek}
        onChange={handleDateChange}
        getNextPeriod={getNextWeek}
        getPreviousPeriod={getPreviousWeek}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <TimesheetReport weekStart={formatDate(currentWeek)} />
      </Suspense>
      {/* <TimesheetReport weekStart={formatDate(currentWeek)} /> */}
    </Container>
  );
};
