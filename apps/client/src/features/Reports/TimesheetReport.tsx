// TimesheetReport.tsx
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Button,
  Divider,
  TableContainer as MuiTableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Fragment, useState, type FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { formatDate, getDate } from 'utils/date';
import { EditTimesheetEntryModal } from './components/EditTimesheetModal';
import { MissingEntriesModal } from './components/MissingEntriesModal';
import { useUsersReport, type Entry } from './hooks/useUserReport';
import { ReportBlock } from './styles';

export const CommentsContainer = styled.div`
  display: grid;
  gap: 0.2rem;

  @media print {
    gap: 0.1rem;
  }
`;

export const CustomTableContainer = styled.div`
  @media print {
    & .MuiTableCell-root {
      padding: 4px;
      font-size: 0.75rem;
    }
  }
`;

export const DayGroup = styled.div<{ $day: string }>`
  margin-bottom: 0.5rem;
  position: relative;

  @media print {
    margin-bottom: 0.3rem;
  }
`;

export const DayHeader = styled.div`
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 4px;
  padding: 4px 8px;

  @media print {
    background-color: ${({ theme }) => theme.palette.grey[50]};
    padding: 2px 6px;
    margin-bottom: 2px;
  }
`;

export const StyledTable = styled(Table)`
  border-collapse: collapse;

  .group-header {
    background-color: ${({ theme }) => theme.palette.grey[100]};
    font-weight: bold;

    td {
      border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
      padding: 6px 10px;
    }

    @media print {
      background-color: ${({ theme }) => theme.palette.grey[50]};

      td {
        padding: 3px 8px;
      }
    }
  }

  .actions-cell {
    @media print {
      display: none;
    }
  }

  .row-cell {
    font-size: 0.875rem;
    padding: 4px 8px;

    @media print {
      padding: 2px 6px;
      font-size: 0.75rem;
    }
  }
`;

export const TotalTime = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-left: 4px solid ${({ theme }) => theme.palette.primary.main};
  border-radius: 4px;
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  padding: 0.5rem 1rem;

  @media print {
    background-color: ${({ theme }) => theme.palette.grey[50]};
    padding: 0.3rem 0.8rem;
    margin-top: 0.8rem;
    border-left: 3px solid ${({ theme }) => theme.palette.primary.main};
  }
`;

export const TimesheetReport: FC<{ weekStart: string }> = ({ weekStart }) => {
  const { users, usersWithNoEntries } = useUsersReport(weekStart);
  const weekStartDate = getDate(weekStart);
  const theme = useTheme();

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const [missingModalOpen, setMissingModalOpen] = useState(false);

  // Group entries by day
  const groupEntriesByDay = (entries: Entry[]) => {
    const grouped: Record<string, Entry[]> = {};

    entries.forEach((entry) => {
      if (!grouped[entry.day]) {
        grouped[entry.day] = [];
      }
      grouped[entry.day].push(entry);
    });

    // Sort days in chronological order
    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ];
    return dayOrder
      .filter((day) => grouped[day])
      .map((day) => ({
        day,
        entries: grouped[day]
      }));
  };

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

      {users.map((user, index) => {
        const groupedEntries = groupEntriesByDay(user.entries);

        return (
          <Fragment key={user.userId}>
            <ReportBlock $isPrinted $isLast={index === users.length - 1}>
              <Typography
                variant="h5"
                sx={{ '@media print': { fontSize: '1.2rem', mb: 0.5 } }}
              >
                {user.userName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mb: 1,
                  display: 'block',
                  '@media print': { fontSize: '0.7rem', mb: 0.5 }
                }}
              >
                {formatDate({ date: weekStartDate, format: 'dd/MM/yyyy' })} -{' '}
                {formatDate({
                  date: weekStartDate.plus({ days: 6 }),
                  format: 'dd/MM/yyyy'
                })}
              </Typography>

              <CustomTableContainer>
                <MuiTableContainer>
                  <StyledTable size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" className="row-cell">
                          Start
                        </TableCell>
                        <TableCell align="center" className="row-cell">
                          End
                        </TableCell>
                        <TableCell className="row-cell" sx={{ width: '50%' }}>
                          Job
                        </TableCell>
                        <TableCell align="center" className="row-cell">
                          Hours
                        </TableCell>
                        <TableCell
                          align="center"
                          className="row-cell actions-cell"
                          sx={{ width: '10%' }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedEntries.map(({ day, entries }) => (
                        <Fragment key={day}>
                          <TableRow className="group-header">
                            <TableCell colSpan={5}>{day}</TableCell>
                          </TableRow>
                          {entries.map((entry) => (
                            <TableRow key={entry.id} hover>
                              <TableCell align="center" className="row-cell">
                                {entry.startTime}
                              </TableCell>
                              <TableCell align="center" className="row-cell">
                                {entry.endTime}
                              </TableCell>
                              <TableCell className="row-cell">{`${entry.jobNumber} - ${entry.projectAddress} (${entry.clientName})`}</TableCell>
                              <TableCell align="center" className="row-cell">
                                {(entry.duration / 60).toFixed(2)}
                              </TableCell>
                              <TableCell align="center" className="row-cell actions-cell">
                                <Button
                                  size="small"
                                  startIcon={<EditRoundedIcon />}
                                  onClick={() => setSelectedEntry(entry)}
                                  sx={{
                                    minWidth: 'auto',
                                    padding: '2px 8px',
                                    '@media print': { display: 'none' }
                                  }}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </Fragment>
                      ))}
                    </TableBody>
                  </StyledTable>
                </MuiTableContainer>
              </CustomTableContainer>

              <TotalTime>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                    '@media print': { fontSize: '0.9rem' }
                  }}
                >
                  Total Hours: {user.totalHours} hrs
                </Typography>
              </TotalTime>

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
                        p: 1,
                        '@media print': {
                          backgroundColor: 'transparent',
                          fontSize: '0.7rem',
                          mt: 0.5,
                          p: 0.5
                        }
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
        );
      })}

      {users.length === 0 && (
        <Typography variant="caption" sx={{ textAlign: 'center', mt: 2 }}>
          No entries found for this week...
        </Typography>
      )}

      {/* Modals */}
      {!!selectedEntry && (
        <EditTimesheetEntryModal
          open={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
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
