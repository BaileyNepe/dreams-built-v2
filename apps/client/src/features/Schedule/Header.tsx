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

const HeaderGrid = styled(Box)<{ $columns: number }>`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: grid;
  font-weight: bold;
  grid-template-columns: ${({ $columns }) =>
    `${projectPartWidth} repeat(${$columns}, 1fr)`};
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
      {formatDate({ date: day, format: 'ccc d LLL' })}
      {hasPermissionToEdit && (
        <Checkbox
          sx={{
            // hide on print
            '@media print': {
              display: 'none'
            }
          }}
          size="small"
          checked={isBlocked}
          onChange={(e) =>
            mutation.mutate({
              date: formatDate({ date: day }),
              deleted: !e.target.checked
            })
          }
        />
      )}
    </DateContainer>
  );
};

export const ScheduleHeader: FC = () => {
  const { datesToShow, blockedDays } = useScheduler();

  return (
    <HeaderGrid $columns={datesToShow.length}>
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
