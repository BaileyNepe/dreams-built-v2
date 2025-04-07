import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { Box, IconButton } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { PrintableContent } from 'components/PrintableContent';
import { usePrint } from 'components/PrintableContent/hooks';
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
  font-weight: bold;
  padding: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: ${projectPartWidth} 1fr;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

/* Component */

export const Schedule: FC = () => {
  const { printRef, handlePrint } = usePrint<HTMLDivElement>({ isPrimaryContent: true });
  const {
    projectPartsWithSegments: jobPartsWithSegments,
    selectedDate,
    changeDate,
    getNextWeek,
    getPreviousWeek
  } = useScheduler();

  return (
    <Container>
      <Header>
        <div />
        <DateSelector
          value={selectedDate}
          defaultValue={selectedDate}
          onChange={changeDate}
          getNextPeriod={getNextWeek}
          getPreviousPeriod={getPreviousWeek}
        />
        <IconButton onClick={handlePrint}>
          <PrintRoundedIcon />
        </IconButton>
      </Header>

      <PrintableContent orientation="landscape" ref={printRef}>
        <ScheduleHeader />

        <Grid>
          {jobPartsWithSegments.map((jp) => (
            <React.Fragment key={jp.id}>
              <JobPartCell>{jp.name}</JobPartCell>
              <InteractiveScheduleRow projectParts={jp} />
            </React.Fragment>
          ))}
        </Grid>
      </PrintableContent>
    </Container>
  );
};
