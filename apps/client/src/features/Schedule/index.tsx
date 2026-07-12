import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { Box, ButtonBase, IconButton, Typography } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { PrintableContent } from 'components/PrintableContent';
import { usePrint } from 'components/PrintableContent/hooks';
import React, { type FC } from 'react';
import styled from 'styled-components';
import { formatDate, generateWeekArray, getDate } from 'utils/date';
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

/* Small screens show one day at a time: the strip jumps between days. */

const Strip = styled.div`
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(7, 1fr);
`;

const DayChip = styled(ButtonBase)<{ $selected: boolean; $isToday: boolean }>`
  && {
    background: ${({ theme, $selected }) =>
      $selected ? theme.palette.primary.main : theme.palette.background.paper};
    border: 1px solid
      ${({ theme, $selected, $isToday }) => {
        if ($selected) return theme.palette.primary.main;
        return $isToday ? theme.palette.primary.main : theme.palette.divider;
      }};
    border-radius: 10px;
    color: ${({ theme, $selected }) =>
      $selected ? theme.palette.primary.contrastText : theme.palette.text.primary};
    display: flex;
    flex-direction: column;
    padding: 0.35rem 0;
  }
`;

const DayStrip: FC = () => {
  const { selectedDate, changeDate } = useScheduler();
  const weekArray = generateWeekArray(
    formatDate({ date: selectedDate.startOf('week') })
  );
  const todayIso = getDate().toISODate();

  return (
    <Strip>
      {weekArray.map((d) => (
        <DayChip
          key={d.day}
          $selected={d.dateFormat.hasSame(selectedDate, 'day')}
          $isToday={d.dateFormat.toISODate() === todayIso}
          onClick={() => changeDate(formatDate({ date: d.dateFormat }))}
          aria-label={d.day}
        >
          <Typography variant="caption" sx={{ opacity: 0.75, lineHeight: 1.2 }}>
            {d.day.slice(0, 3)}
          </Typography>
          <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
            {d.date}
          </Typography>
        </DayChip>
      ))}
    </Strip>
  );
};

/* Component */

export const Schedule: FC = () => {
  const {
    projectPartsWithSegments,
    toggleBlockedDaysVisibility,
    selectedDate,
    changeDate,
    getNextWeek,
    getPreviousWeek,
    isSmallScreen
  } = useScheduler();
  const { printRef, handlePrint } = usePrint<HTMLDivElement>({
    isPrimaryContent: true,
    onAfterPrint: toggleBlockedDaysVisibility
  });

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
        <IconButton
          onClick={() => {
            toggleBlockedDaysVisibility();
            // Delay the print to allow the toggle to take effect on the DOM
            setTimeout(() => {
              handlePrint();
            }, 0);
          }}
        >
          <PrintRoundedIcon />
        </IconButton>
      </Header>

      {isSmallScreen && <DayStrip />}

      <PrintableContent orientation="landscape" ref={printRef}>
        <ScheduleHeader />

        <Grid>
          {projectPartsWithSegments.map((jp) => (
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
