// TimesheetReport.tsx
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Button, Divider, Typography } from '@mui/material';
import { EnhancedTable } from 'components/EnhancedTable';
import { Fragment, useState, type FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { formatDate, getDate } from 'utils/date';
import { EditTimesheetEntryModal } from './components/EditTimesheetModal';
import { MissingEntriesModal } from './components/MissingEntriesModal';
import { useUsersReport, type Entry } from './hooks/useUserReport';
import { ReportBlock, TotalRow } from './styles';

export const CommentsContainer = styled.div`
  display: grid;
  gap: 0.2rem;
`;

export const TimesheetReport: FC<{ weekStart: string }> = ({ weekStart }) => {
  const { users, usersWithNoEntries } = useUsersReport(weekStart);
  const weekStartDate = getDate(weekStart);
  const theme = useTheme();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const [missingModalOpen, setMissingModalOpen] = useState(false);

  return (
    <>
      {/* Quick Summary at the Top */}
      {users.length > 0 && (
        <>
          <ReportBlock>
            {usersWithNoEntries.length > 0 && (
              <Button
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => setMissingModalOpen(true)}
              >
                Show Users with No Entries ({usersWithNoEntries.length})
              </Button>
            )}
            <Typography variant="h6" sx={{ mb: 1 }}>
              Timesheet Summary
            </Typography>
            {users.map((user) => (
              <Typography key={user.userId} variant="body2">
                <strong>{user.userName}</strong>: {user.totalHours} hrs{' '}
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: theme.palette.warning.main,
                    fontStyle: 'italic'
                  }}
                >
                  {user.notes.length > 0 && `(${user.notes.length} notes)`}
                </span>
              </Typography>
            ))}
          </ReportBlock>
          <Divider
            sx={{
              borderColor: theme.palette.grey[300],
              my: 2,

              '@media print': {
                display: 'none'
              }
            }}
          />
        </>
      )}

      {users.map((user, index) => (
        <Fragment key={user.userId}>
          <ReportBlock $isPrinted $isLast={index === users.length - 1}>
            <Typography variant="h5">{user.userName}</Typography>
            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
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
                job: `${entry.jobNumber} - ${entry.projectAddress} (${entry.clientName})`,
                totalTime: `${(entry.duration / 60).toFixed(2)}`,
                actions: [
                  {
                    icon: <EditRoundedIcon />,
                    onClick: () => {
                      setSelectedEntry(entry);
                      setEditModalOpen(true);
                    },
                    label: 'Edit'
                  }
                ]
              }))}
            />

            <TotalRow>
              <Typography variant="body2">
                <strong>Total:</strong> {user.totalHours} hrs
              </Typography>
            </TotalRow>
            {user.notes.length > 0 && (
              <CommentsContainer>
                {user.notes.map((note) => (
                  <Typography
                    key={note.id}
                    variant="caption"
                    color="textSecondary"
                    sx={{
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: 1,

                      display: 'inline-block',
                      fontStyle: 'italic',
                      mt: 1,
                      p: 1
                    }}
                  >
                    <strong>{note.day}</strong> - {note.message}
                  </Typography>
                ))}
              </CommentsContainer>
            )}
          </ReportBlock>
          <Divider
            sx={{
              borderColor: theme.palette.grey[300],
              my: 2,
              '@media print': {
                display: 'none'
              }
            }}
          />
        </Fragment>
      ))}

      {users.length === 0 && (
        <Typography variant="caption" sx={{ textAlign: 'center', mt: 2 }}>
          No entries found for this week...
        </Typography>
      )}

      {/* Modals */}
      {selectedEntry && (
        <EditTimesheetEntryModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          entry={selectedEntry}
        />
      )}
      <MissingEntriesModal
        open={missingModalOpen}
        users={usersWithNoEntries}
        onClose={() => setMissingModalOpen(false)}
      />
    </>
  );
};
