import { Box } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import React, { type FC } from 'react';
import styled from 'styled-components';
import { ScheduleHeader } from './Header';
import { InteractiveScheduleRow } from './Row';
import { useScheduler } from './components/useSchedule';

/* Styles */

const Container = styled(Box)`
  padding: 1rem;
`;

const JobPartCell = styled(Box)`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-right: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: flex;
  padding: 0.5rem;
`;

/* Component */

export const Schedule: FC = () => {
  const { jobPartsWithSegments, selectedDate, changeDate } = useScheduler();

  return (
    <Container>
      <BasicDatePicker value={selectedDate} onChange={changeDate} />
      <ScheduleHeader />

      <Box display="grid" gridTemplateColumns="max-content 1fr">
        {jobPartsWithSegments.map((jp) => {
          const maxLane = Math.max(...jp.tasks.map((t) => t.lane), 0);
          const rowHeight = (maxLane + 1) * 30 + 38;
          return (
            <React.Fragment key={jp.id}>
              <JobPartCell height={`${rowHeight}px`}>{jp.name}</JobPartCell>
              <InteractiveScheduleRow jp={jp} rowHeight={rowHeight} />
            </React.Fragment>
          );
        })}
      </Box>
    </Container>
  );
};
