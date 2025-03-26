import { Box } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';
import { formatDate, isMatchingDates } from 'utils/date';
import { useScheduler } from './useSchedule';

const DayCell = styled(Box)<{ $isBlocked?: boolean }>`
  background-color: ${({ $isBlocked, theme }) =>
    $isBlocked ? theme.palette.grey[300] : 'inherit'};
  padding: 0.5rem;
  text-align: center;
`;

const HeaderGrid = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: grid;
  font-weight: bold;
  grid-template-columns: 200px repeat(7, 1fr);
`;

/* Component */

export const ScheduleHeader: FC = () => {
  const { datesToShow, blockedDays } = useScheduler();

  return (
    <HeaderGrid>
      <Box padding="0.5rem">Job Part</Box>
      {datesToShow.map((day, i) => (
        <DayCell key={i} $isBlocked={isMatchingDates(day, blockedDays)}>
          {formatDate(day, 'd')}
        </DayCell>
      ))}
    </HeaderGrid>
  );
};
