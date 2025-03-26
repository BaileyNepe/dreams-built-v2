import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { formatDate } from 'utils/date';

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

const blockedDays: string[] = ['2025-03-13', '2025-03-15'];

export const ScheduleHeader: FC<{
  datesToShow: DateTime[];
}> = ({ datesToShow }) => (
  <HeaderGrid>
    <Box padding="0.5rem">Job Part</Box>
    {datesToShow.map((day, i) => (
      <DayCell key={i} $isBlocked={blockedDays.includes(formatDate(day, 'yyyy-MM-dd'))}>
        {formatDate(day, 'd')}
      </DayCell>
    ))}
  </HeaderGrid>
);
