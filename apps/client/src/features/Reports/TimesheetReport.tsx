import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Divider, Typography } from '@mui/material';
import { EnhancedTable } from 'components/EnhancedTable';
import { Fragment, type FC } from 'react';
import styled from 'styled-components';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { useUsersReport } from './hooks/useUserReport';

const UserBlock = styled.div`
  padding: 1rem;
`;

const TotalHours = styled.div`
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ theme }) => theme.palette.success.main};
  display: flex;
  font-weight: bold;
  justify-self: flex-end;
  margin-top: 1rem;
  outline: 1px solid ${({ theme }) => theme.palette.success.main};
  padding: 0.5rem;

  width: max-content;
`;

const CommentsContainer = styled.div`
  display: grid;
  gap: 0.2rem;
`;

export const TimesheetReport: FC<{ weekStart: string }> = ({ weekStart }) => {
  const { users, usersWithNoEntries } = useUsersReport(weekStart);
  const weekStartDate = getDate(weekStart);

  return (
    <>
      {users.map((user) => (
        <Fragment key={user.userId}>
          <UserBlock key={user.userId}>
            <Typography variant="h3" sx={{ mb: 2 }} color="textDark">
              {user.userName}
            </Typography>
            <div>
              <Typography
                variant="caption"
                color="info"
                fontStyle="italic"
                sx={{ mb: 2 }}
              >
                {formatDate(weekStartDate, 'dd/MM/yyyy')} -{' '}
                {formatDate(weekStartDate.plus({ days: 6 }), 'dd/MM/yyyy')}
              </Typography>
              <EnhancedTable
                size="x-small"
                hasShadow={false}
                headers={[
                  { id: 'day', align: 'center' },
                  { id: 'startTime', align: 'center' },
                  { id: 'endTime', align: 'center' },
                  { id: 'job', width: '50%' },
                  { id: 'totalTime', align: 'center' },
                  { id: 'actions', align: 'center', width: '10%' }
                ]}
                rows={user.entries.map((entry) => ({
                  id: entry.id,
                  day: entry.day,
                  startTime: entry.startTime,
                  endTime: entry.endTime,
                  job: `${entry.jobNumber} - ${entry.projectAddress}`,
                  totalTime: `${(entry.duration / 60).toFixed(2)}`,
                  actions: [
                    {
                      icon: <EditRoundedIcon />,
                      onClick: () => {
                        console.log('Edit entry', entry.id);
                      },
                      label: 'Edit'
                    }
                  ]
                }))}
              />
              <TotalHours>Total: {user.totalHours}</TotalHours>
            </div>
            {user.notes.length > 0 && (
              <CommentsContainer>
                <Typography variant="caption" color="textDark" fontWeight="bold">
                  Comments:
                </Typography>
                {user.notes.map((note) => (
                  <Typography
                    key={note.id}
                    variant="caption"
                    color="textDark"
                    sx={{
                      backgroundColor: (theme) => theme.palette.grey[200],
                      borderRadius: 1,
                      display: 'inline-block',
                      fontStyle: 'italic',

                      marginTop: 1,
                      padding: 1
                    }}
                  >
                    <strong>{note.day}</strong> - {note.message}
                  </Typography>
                ))}
              </CommentsContainer>
            )}
          </UserBlock>
          {user.userId !== users[users.length - 1]?.userId && (
            <Divider
              sx={{
                borderColor: (theme) => theme.palette.grey[300],
                my: 2
              }}
            />
          )}
        </Fragment>
      ))}

      {users.length === 0 && (
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            mt: 2
          }}
        >
          No entries found for this week...
        </Typography>
      )}
    </>
  );
};
