/* eslint-disable @typescript-eslint/no-use-before-define */
import { Alert, Box, Card, CardContent, Grid, Paper, Typography } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useScheduleQuery } from 'api/schedule';
import { useTimesheetEntries } from 'api/timesheet';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate, getDate, getEndOfWeek, getWeekStart } from 'utils/date';

// Styled components for the dashboard
const DashboardContainer = styled(Box)`
  margin: 0 auto;
  max-width: 1200px;
  padding: ${(props) => props.theme.spacing?.(3) || '24px'};
`;

const WelcomeCard = styled(Card)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.light};
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: 500;
  margin-bottom: 2rem;
`;

const ScheduleItem = styled(Paper)`
  && {
    align-items: center;
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    display: flex;
    justify-content: space-between;
    margin-bottom: ${(props) => props.theme.spacing?.(1) || '8px'};
    padding: ${(props) => props.theme.spacing?.(2) || '16px'};
  }
`;

const NoticeBox = styled(Paper)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.outline};
    padding: ${(props) => props.theme.spacing?.(2) || '16px'};
    width: 100%;
  }
`;

const NoticeAlert = styled(Alert)`
  width: 100%;
`;

const Board = styled.div`
  display: grid;
  gap: 2rem;
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BlockGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Items = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const AdminContactMessage = styled(Card)`
  && {
    box-shadow: ${(props) => props.theme.customShadows?.light};
    margin-top: 2rem;
    padding: ${(props) => props.theme.spacing?.(4) || '32px'};
    text-align: center;
  }
`;

export const Route = createLazyFileRoute('/_dashboard/dashboard/')({
  component: Dashboard
});

function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <WelcomeCard>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs>
              <Typography variant="h4">Welcome, {user.firstName || 'User'}</Typography>
              <Typography variant="body1" color="textSecondary">
                {formatDate({ format: 'ccc d LLL' })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </WelcomeCard>

      {user.role === 'USER' ? <UserContactAdmin /> : <DashboardContent />}
    </DashboardContainer>
  );
}

function UserContactAdmin() {
  return (
    <AdminContactMessage>
      <Typography variant="h5" gutterBottom>
        Limited Access
      </Typography>
      <Typography variant="body1" paragraph>
        Please contact the administrator to request full access to the dashboard.
      </Typography>
      <Typography variant="body1" fontWeight="bold">
        Email: admin@dreamsbuilt.co.nz
      </Typography>
    </AdminContactMessage>
  );
}

function DashboardContent() {
  const { user } = useAuth();

  const userEntries = useTimesheetEntries({
    weekStart: getWeekStart(getEndOfWeek({ weeks: -1 }).toFormat('yyyy-MM-dd')),
    userId: user.id
  });

  const upcomingSchedule = useScheduleQuery(
    formatDate(),
    formatDate({ date: getEndOfWeek({ weeks: 1 }) })
  );

  const hasNotEnteredTimesheet =
    (!userEntries.data?.entries.length || !userEntries.data?.notes.length) &&
    !userEntries.isLoading &&
    user.role === 'EMPLOYEE';

  return (
    <Board>
      {/* Notices section */}
      <BlockGrid>
        <SectionTitle variant="h5">Notices</SectionTitle>

        {hasNotEnteredTimesheet && (
          <NoticeAlert
            severity="warning"
            sx={{
              border: (theme) => `1px solid ${theme.palette.warning.main}`
            }}
          >
            <Typography variant="body2" color="warning.main" fontStyle="italic">
              You have not entered any timesheets for the last week.
            </Typography>
          </NoticeAlert>
        )}

        <NoticeBox>
          <Typography variant="subtitle1" fontWeight="bold">
            Closed Days
          </Typography>
          {upcomingSchedule?.blockedDays.map((day, index) => (
            <Box key={index} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>
                  {formatDate({ date: getDate(day.date), format: 'ccc d LLL' })}
                </strong>
                : {day.details || 'Closed'}
              </Typography>
            </Box>
          ))}
        </NoticeBox>
      </BlockGrid>

      {/* Upcoming schedule section */}
      <BlockGrid>
        <SectionTitle variant="h5">Upcoming Schedule</SectionTitle>

        <Items>
          {(upcomingSchedule?.schedule.length ?? 0) > 0 ? (
            upcomingSchedule?.schedule.flatMap((scheduleItem) =>
              scheduleItem.projectSchedule.map((item) => (
                <ScheduleItem key={`${scheduleItem.id}-${item.id}`} elevation={1}>
                  <Box>
                    <Typography variant="subtitle1">
                      {item.project.jobNumber}: {item.project.address}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(item.startDate).toLocaleDateString()} -{' '}
                      {new Date(item.endDate).toLocaleDateString()}
                    </Typography>
                    {item.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {item.notes}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: item.project.color
                    }}
                  />
                </ScheduleItem>
              ))
            )
          ) : (
            <Typography variant="body1">No upcoming scheduled projects.</Typography>
          )}
        </Items>
      </BlockGrid>
    </Board>
  );
}
