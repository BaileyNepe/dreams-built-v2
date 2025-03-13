import { Box } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';

const DayCell = styled(Box)<{ blocked?: boolean }>`
  background-color: ${({ blocked }) => (blocked ? '#f0f0f0' : '#eee')};
  /* Vertical border removed */
  padding: 8px;
  text-align: center;
`;

const HeaderGrid = styled(Box)<{ daysToShow: number }>`
  border-bottom: 1px solid #ccc;
  display: grid;
  font-weight: bold;
  grid-template-columns: 200px repeat(${({ daysToShow }) => daysToShow}, 1fr);
`;

export const ScheduleHeader: FC<{
  daysToShow: number;
  datesToShow: Date[];
  isBlocked: (date: Date) => boolean;
}> = ({ daysToShow, datesToShow, isBlocked }) => (
  <HeaderGrid daysToShow={daysToShow}>
    <Box padding="8px">Job Part</Box>
    {datesToShow.map((day, i) => (
      <DayCell key={i} blocked={isBlocked(day)}>
        {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </DayCell>
    ))}
  </HeaderGrid>
);
