import { Skeleton, Tab, Tabs } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { Suspense, useState, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { ProjectReport } from './ProjectReport'; // Make sure this component exists
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
`;

export const Report: FC = () => {
  // State for the week selection
  const [currentWeek, setCurrentWeek] = useState(getDate(getWeekStart()));
  // State for selecting the active report type
  const [selectedReport, setSelectedReport] = useState<'timesheet' | 'project'>(
    'timesheet'
  );

  const getNextWeek = () => {
    setCurrentWeek((prev) => prev.plus({ weeks: 1 }));
  };

  const getPreviousWeek = () => {
    setCurrentWeek((prev) => prev.minus({ weeks: 1 }));
  };

  const handleDateChange = (date: string) => {
    setCurrentWeek(getDate(getWeekStart(date)));
  };

  const handleReportChange = (
    _: React.SyntheticEvent,
    newValue: 'timesheet' | 'project'
  ) => {
    setSelectedReport(newValue);
  };

  return (
    <Container>
      <HeaderContainer>
        <Tabs
          value={selectedReport}
          onChange={handleReportChange}
          textColor="primary"
          indicatorColor="primary"
          centered
        >
          <Tab label="Timesheet Report" value="timesheet" />
          <Tab label="Project Report" value="project" />
        </Tabs>
        <DateSelector
          value={currentWeek}
          defaultValue={currentWeek}
          onChange={handleDateChange}
          getNextPeriod={getNextWeek}
          getPreviousPeriod={getPreviousWeek}
        />
      </HeaderContainer>

      <Suspense
        fallback={Array(2).fill(
          <Skeleton variant="rectangular" height={300} sx={{ m: 1, borderRadius: 1 }} />
        )}
      >
        <ReportContainer>
          {selectedReport === 'timesheet' ? (
            <TimesheetReport weekStart={formatDate(currentWeek)} />
          ) : (
            <ProjectReport weekStart={formatDate(currentWeek)} />
          )}
        </ReportContainer>
      </Suspense>
    </Container>
  );
};
