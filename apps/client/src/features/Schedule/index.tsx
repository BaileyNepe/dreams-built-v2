import { Box } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import React, { type FC } from 'react';
import styled from 'styled-components';
import { ScheduleHeader } from './Header';
import { InteractiveScheduleRow } from './Row';
import { projectPartWidth } from './components/constants';
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${projectPartWidth} 1fr;
`;

/* Component */

export const Schedule: FC = () => {
  const {
    projectPartsWithSegments: jobPartsWithSegments,
    selectedDate,
    changeDate
  } = useScheduler();

  return (
    <Container>
      <BasicDatePicker value={selectedDate} onChange={changeDate} />
      <ScheduleHeader />

      <Grid>
        {jobPartsWithSegments.map((jp) => (
          <React.Fragment key={jp.id}>
            <JobPartCell>{jp.name}</JobPartCell>
            <InteractiveScheduleRow projectParts={jp} />
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  );
};
