import { type FC } from 'react';
import styled from 'styled-components';
import { generateWeekArray } from 'utils/date';
import { useTimesheet } from '../hooks/useTimesheet';
import { TimesheetDay } from './Day';

const Container = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1rem 0;
`;

export const TimesheetWeek: FC = () => {
  const { weekStart } = useTimesheet();
  const weekArray = generateWeekArray(weekStart);

  return (
    <Container>
      {weekArray.map((date) => (
        <TimesheetDay key={date.date} {...date} />
      ))}
    </Container>
  );
};
