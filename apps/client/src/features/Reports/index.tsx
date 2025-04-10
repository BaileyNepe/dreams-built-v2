import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { IconButton, Skeleton, Tab, Tabs } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { PrintableContent } from 'components/PrintableContent';
import { usePrint } from 'components/PrintableContent/hooks';
import { Suspense, useState, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { ProjectReport } from './ProjectReport';
import { TimesheetReport } from './TimesheetReport';

const Container = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  display: grid;
  gap: 0.5rem;
`;

const HeaderContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 0rem 0;
  width: 100%;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 0;
    width: 100%;
  }
`;

const ReportContainer = styled.div`
  overflow: auto;
  padding: 0 1rem 1rem 1rem;
`;

const Actions = styled.div`
  align-items: center;
  display: flex;
  gap: 2rem;
  justify-content: center;
`;

export const Report: FC = () => {
  const [currentWeek, setCurrentWeek] = useState(getDate(getWeekStart()));
  const { printRef, handlePrint } = usePrint<HTMLDivElement>({ isPrimaryContent: true });

  const [selectedReport, setSelectedReport] = useState<'timesheet' | 'project'>(
    'timesheet'
  );

  return (
    <Container>
      <HeaderContainer>
        <Actions>
          <Tabs
            value={selectedReport}
            onChange={(_, newValue: 'timesheet' | 'project') =>
              setSelectedReport(newValue)
            }
            textColor="primary"
            indicatorColor="primary"
            centered
          >
            <Tab label="Timesheet Report" value="timesheet" />
            <Tab label="Project Report" value="project" />
          </Tabs>
          <IconButton onClick={handlePrint}>
            <PrintRoundedIcon />
          </IconButton>
        </Actions>
        <DateSelector
          value={currentWeek}
          defaultValue={currentWeek}
          onChange={(date: string) => setCurrentWeek(getDate(getWeekStart(date)))}
          getNextPeriod={() => setCurrentWeek((prev) => prev.plus({ weeks: 1 }))}
          getPreviousPeriod={() => setCurrentWeek((prev) => prev.minus({ weeks: 1 }))}
        />
      </HeaderContainer>

      <Suspense
        fallback={Array(2).fill(
          <Skeleton variant="rectangular" height={300} sx={{ m: 1, borderRadius: 1 }} />
        )}
      >
        <ReportContainer>
          <PrintableContent ref={printRef}>
            {selectedReport === 'timesheet' ? (
              <TimesheetReport weekStart={formatDate({ date: currentWeek })} />
            ) : (
              <ProjectReport weekStart={formatDate({ date: currentWeek })} />
            )}
          </PrintableContent>
        </ReportContainer>
      </Suspense>
    </Container>
  );
};
