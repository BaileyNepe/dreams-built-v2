import { Box } from '@mui/material';
import React, { type FC } from 'react';
import styled from 'styled-components';
import { BlockDaysOverlay } from './BlockDaysOverlay';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleRow } from './ScheduleRow';
import { useScheduler } from './useSchedule';

/* Styles */

const Container = styled(Box)`
  padding: 1rem;
`;

const JobPartCell = styled(Box)`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: flex;
  padding: 0.5rem;
`;

const ScheduleRowContainer = styled(Box)<{ $minHeight: string }>`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  min-height: ${({ $minHeight: minHeight }) => minHeight};
  position: relative;
`;

/* Component */

export const Schedule: FC = () => {
  const { jobPartsWithSegments } = useScheduler();

  return (
    <Container>
      <ScheduleHeader />

      <Box display="grid" gridTemplateColumns="200px 1fr">
        {jobPartsWithSegments.map((jp) => {
          const maxLane = Math.max(...jp.tasks.map((t) => t.lane), 0);
          const rowHeight = (maxLane + 1) * 30 + 20;
          return (
            <React.Fragment key={jp.id}>
              <JobPartCell height={`${rowHeight}px`}>{jp.name}</JobPartCell>
              <ScheduleRowContainer $minHeight={`${rowHeight}px`}>
                <BlockDaysOverlay />
                <ScheduleRow tasks={jp.tasks} />
              </ScheduleRowContainer>
            </React.Fragment>
          );
        })}
      </Box>
    </Container>
  );
};
