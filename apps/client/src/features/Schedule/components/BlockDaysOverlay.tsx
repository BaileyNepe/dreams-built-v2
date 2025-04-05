import { Box } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';
import { isMatchingDates } from 'utils/date';
import { useScheduler } from './useSchedule';

const UnderlayGrid = styled(Box)<{ $isSmallScreen: boolean }>`
  bottom: 0;
  display: grid;
  grid-template-columns: ${({ $isSmallScreen }) =>
    $isSmallScreen ? `1fr` : `repeat(7, 1fr)`};
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const UnderlayCell = styled(Box)<{ $isBlocked?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.grey[300]};

  display: flex;

  justify-content: center;
  opacity: ${({ $isBlocked }) => ($isBlocked ? 0.5 : 0)};
  text-align: center;
`;

export const BlockDaysOverlay: FC = () => {
  const { blockedDays, datesToShow, isSmallScreen } = useScheduler();

  return (
    <UnderlayGrid $isSmallScreen={isSmallScreen}>
      {datesToShow.map((day, idx) => (
        <UnderlayCell
          key={idx}
          $isBlocked={isMatchingDates(
            day,
            blockedDays.map((d) => d.date)
          )}
        >
          {blockedDays.find((d) => day.day === d.date.day)?.details}
        </UnderlayCell>
      ))}
    </UnderlayGrid>
  );
};
