import PlusIcon from '@mui/icons-material/Add';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import { IconButton, Typography } from '@mui/material';
import { Button } from 'components/Button';
import Loader from 'components/Loader';
import { useMemo, useState, type FC, type JSX } from 'react';
import styled from 'styled-components';
import { calculateTimeDifference } from 'utils/date';
import { useTimesheet } from '../hooks/useTimesheet';
import { CommentModal } from './CommentModal';
import { Entry, timesheetTemplateColumns } from './Entry';

/* ----------------------------- Styled Components ---------------------------- */

const Container = styled.div`
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  padding: 1rem;
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const HeaderRow = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.grey[300]};
  border-bottom: 2px solid ${({ theme }) => theme.palette.grey[400]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px
    ${({ theme }) => theme.shape.borderRadius}px 0 0;
  display: grid;
  font-weight: 600;
  gap: 0.5rem;
  grid-template-columns: ${timesheetTemplateColumns};
  margin-top: 0.5rem;
  padding: 0.5rem;
  text-align: center;
`;

const Body = styled.div`
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 0;

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    gap: 1rem;
  }
`;

const FooterRow = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.grey[300]};
  border-radius: 0 0 ${({ theme }) => theme.shape.borderRadius}px
    ${({ theme }) => theme.shape.borderRadius}px;
  border-top: 2px solid ${({ theme }) => theme.palette.grey[400]};
  display: grid;
  gap: 0.5rem;
  grid-template-columns: ${timesheetTemplateColumns};
  padding: 0.5rem;
  text-align: right;

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: none;
  }
`;

const NoteIconButton: FC<{
  hasNote: boolean;
  onClick: () => void;
}> = ({ hasNote, onClick }) => (
  <IconButton
    aria-label="add note"
    color={hasNote ? 'success' : 'default'}
    onClick={onClick}
  >
    <MessageRoundedIcon sx={{ width: 18, height: 18 }} />
  </IconButton>
);

const AddEntryButton: FC<{ fullWidth?: boolean; onClick: () => void }> = ({
  fullWidth,
  onClick
}) => (
  <Button onClick={onClick} startIcon={<PlusIcon />} fullWidth={fullWidth}>
    Add Entry
  </Button>
);

/* ----------------------------- Desktop View ---------------------------- */

interface TimesheetDayViewProps {
  day: string;
  dateLabel: string; // combined "date + ordinal + month"
  dayEntriesLength: number;
  totalTime: string;
  isLoading: boolean;
  onAddEntry: () => void;
  openCommentModal: () => void;
  dayEntriesJSX: JSX.Element[]; // rendered <Entry /> components
  hasNote: boolean;
}

const TimesheetDayDesktopView: FC<TimesheetDayViewProps> = ({
  day,
  dateLabel,
  dayEntriesLength,
  totalTime,
  isLoading,
  onAddEntry,
  dayEntriesJSX,
  openCommentModal,
  hasNote
}) => (
  <>
    <CardHeader>
      <Typography variant="h5" component="h2">
        {day} - {dateLabel}
      </Typography>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <NoteIconButton hasNote={hasNote} onClick={openCommentModal} />
        <AddEntryButton onClick={onAddEntry} />
      </div>
    </CardHeader>

    {Boolean(dayEntriesLength) && (
      <HeaderRow>
        <span>Start Time</span>
        <span>End Time</span>
        <span>Project</span>
        <span />
        <span />
      </HeaderRow>
    )}

    <Body>{isLoading ? <Loader /> : dayEntriesJSX}</Body>

    {Boolean(dayEntriesLength) && (
      <FooterRow>
        <span />
        <span />
        <span>
          <strong>Total</strong>
        </span>
        <span style={{ textAlign: 'right' }}>{totalTime}</span>
        <span />
      </FooterRow>
    )}
  </>
);

/* ----------------------------- Main TimesheetDay ---------------------------- */

export const TimesheetDay: FC<{
  day: string;
  date: string; // e.g. "4"
  ordinal: string; // e.g. "th"
  month: string; // e.g. "Mar"
}> = ({ day, date, ordinal, month }) => {
  const { entries, addEntry, notes, isLoading } = useTimesheet();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Filter the day-specific entries and note
  const dayEntries = entries.filter((entry) => entry.day === day);
  const todayNotes = notes.find((note) => note.day === day);
  const dayEntriesJSX = useMemo(
    () => dayEntries.map((entry) => <Entry key={entry.id} entryId={entry.id} />),
    [dayEntries]
  );

  // Calculate total hours/minutes
  const totalTime = useMemo(() => {
    const totalMinutes = dayEntries.reduce((acc, entry) => {
      const time = calculateTimeDifference(entry.startTime, entry.endTime);
      return acc + time.totalMinutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [dayEntries]);

  const dateLabel = `${date}${ordinal} ${month}`;
  const dayEntriesLength = dayEntries.length;
  const hasNote = Boolean(todayNotes?.message);

  const viewProps: TimesheetDayViewProps = {
    day,
    dateLabel,
    dayEntriesLength,
    totalTime,
    isLoading,
    onAddEntry: () => addEntry(day),
    dayEntriesJSX,
    hasNote,
    openCommentModal: () => setIsCommentModalOpen(true)
  };

  return (
    <>
      <Container>
        <TimesheetDayDesktopView {...viewProps} />
      </Container>
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        day={day}
      />
    </>
  );
};
