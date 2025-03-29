import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import React, { type FC } from 'react';
import styled from 'styled-components';
import { ScheduleHeader } from './Header';
import { InteractiveScheduleRow } from './Row';
import { projectPartWidth } from './components/constants';
import { useScheduler } from './components/useSchedule';

/* Styles */

const Container = styled(Box)`
  display: grid;
  gap: 1rem;
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

const DateSelectors = styled.div`
  align-items: center;
  display: flex;
  gap: 0.2rem;
  justify-content: center;

  .MuiStack-root {
    padding: 0;
  }
`;

/* Component */

export const Schedule: FC = () => {
  const {
    projectPartsWithSegments: jobPartsWithSegments,
    selectedDate,
    changeDate,
    getNextWeek,
    getPreviousWeek
  } = useScheduler();

  return (
    <Container>
      <DateSelectors>
        <IconButton onClick={getPreviousWeek}>
          <ChevronLeftIcon />
        </IconButton>
        <BasicDatePicker
          value={selectedDate}
          defaultValue={selectedDate}
          onChange={changeDate}
        />
        <IconButton onClick={getNextWeek}>
          <ChevronRightIcon />
        </IconButton>
      </DateSelectors>

      <div>
        <ScheduleHeader />

        <Grid>
          {jobPartsWithSegments.map((jp) => (
            <React.Fragment key={jp.id}>
              <JobPartCell>{jp.name}</JobPartCell>
              <InteractiveScheduleRow projectParts={jp} />
            </React.Fragment>
          ))}
        </Grid>
      </div>
    </Container>
  );
};
