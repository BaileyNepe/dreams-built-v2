import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { isMatchingDates } from 'utils/date';

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

const blockedDays: string[] = ['2025-03-13', '2025-03-15'];

export const BlockDaysOverlay: FC<{
  datesToShow: DateTime[];
}> = ({ datesToShow }) => (
  <UnderlayGrid>
    {datesToShow.map((day, idx) => (
      <UnderlayCell key={idx} $isBlocked={isMatchingDates(day, blockedDays)} />
    ))}
  </UnderlayGrid>
);
