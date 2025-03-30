import { Skeleton } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { Suspense, useState, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { TimesheetReport } from './TimesheetReport';

const Container = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  display: grid;
  gap: 0.5rem;
  padding: 2rem;
`;

const Header = styled.h2`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  /* margin: 0; */

  text-align: center;
`;

const HeaderContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 1rem;
  width: 100%;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
    padding-bottom: 2rem;
  }
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
      <HeaderContainer>
        <Header>Timesheet Report</Header>
        <DateSelector
          value={currentWeek}
          defaultValue={currentWeek}
          onChange={handleDateChange}
          getNextPeriod={getNextWeek}
          getPreviousPeriod={getPreviousWeek}
        />
      </HeaderContainer>

      <Suspense
        fallback={Array(2).fill(
          <Skeleton variant="rectangular" height={300} sx={{ m: 1, borderRadius: 1 }} />
        )}
      >
        <TimesheetReport weekStart={formatDate(currentWeek)} />
      </Suspense>
    </Container>
  );
};
