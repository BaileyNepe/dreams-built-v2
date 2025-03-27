import { Box, Checkbox } from '@mui/material';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { formatDate, isMatchingDates } from 'utils/date';
import { useScheduler } from './useSchedule';

const DayCell = styled(Box)`
  padding: 0.5rem;
  text-align: center;
`;

const HeaderGrid = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: grid;
  font-weight: bold;
  grid-template-columns: 200px repeat(7, 1fr);
`;

const DayCellContainer: FC<{
  day: DateTime;
  isBlocked: boolean;
}> = ({ day, isBlocked }) => (
  <Box position="relative" padding="0.5rem" textAlign="center">
    <Checkbox
      size="small"
      checked={isBlocked}
      onChange={(e) => {
        console.log(e.target.checked);
      }}
      style={{ position: 'absolute', top: 0, right: 0 }}
    />
    {formatDate(day, 'd')}
  </Box>
);

/* Component */

export const ScheduleHeader: FC = () => {
  const { datesToShow, blockedDays } = useScheduler();

  return (
    <HeaderGrid>
      <Box padding="0.5rem">Job Part</Box>
      {datesToShow.map((day, i) => (
        <DayCell key={i}>
          <DayCellContainer
            day={day}
            isBlocked={blockedDays.some((bd) => isMatchingDates(bd, [day]))}
          />
        </DayCell>
      ))}
    </HeaderGrid>
  );
};
