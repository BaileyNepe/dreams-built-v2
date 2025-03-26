import { Box } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';
import { isMatchingDates } from 'utils/date';
import { useScheduler } from './useSchedule';

const UnderlayGrid = styled(Box)`
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const UnderlayCell = styled(Box)<{ $isBlocked?: boolean }>`
  background-color: ${({ $isBlocked, theme }) =>
    $isBlocked ? theme.palette.grey[300] : 'inherit'};
`;

export const BlockDaysOverlay: FC = () => {
  const { blockedDays, datesToShow } = useScheduler();

  return (
    <UnderlayGrid>
      {datesToShow.map((day, idx) => (
        <UnderlayCell key={idx} $isBlocked={isMatchingDates(day, blockedDays)} />
      ))}
    </UnderlayGrid>
  );
};
