import { Box, Checkbox } from '@mui/material';
import { useBlockMutation } from 'api/schedule';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { formatDate, isMatchingDates } from 'utils/date';
import { projectPartWidth } from './components/constants';
import { useScheduler } from './components/useSchedule';

const DayCell = styled(Box)`
  padding: 0.5rem;
  text-align: center;
`;

const HeaderGrid = styled(Box)<{ $isSmallScreen: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: grid;
  font-weight: bold;
  grid-template-columns: ${({ $isSmallScreen }) =>
    $isSmallScreen ? `${projectPartWidth} 1fr` : `${projectPartWidth} repeat(7, 1fr)`};
`;

const DateContainer = styled(Box)`
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const DayCellContainer: FC<{
  day: DateTime;
  isBlocked: boolean;
}> = ({ day, isBlocked }) => {
  const { hasPermissionToEdit } = useScheduler();
  const mutation = useBlockMutation();

  return (
    <DateContainer>
      {formatDate(day, 'ccc d LLL')}
      {hasPermissionToEdit && (
        <Checkbox
          size="small"
          checked={isBlocked}
          onChange={(e) =>
            mutation.mutate({
              date: formatDate(day),
              deleted: !e.target.checked
            })
          }
        />
      )}
    </DateContainer>
  );
};

export const ScheduleHeader: FC = () => {
  const { datesToShow, blockedDays, isSmallScreen } = useScheduler();

  return (
    <HeaderGrid $isSmallScreen={isSmallScreen}>
      <Box padding="0.5rem"></Box>
      {datesToShow.map((day, i) => (
        <DayCell key={i}>
          <DayCellContainer
            day={day}
            isBlocked={blockedDays.some((bd) => isMatchingDates(bd.date, [day]))}
          />
        </DayCell>
      ))}
    </HeaderGrid>
  );
};
