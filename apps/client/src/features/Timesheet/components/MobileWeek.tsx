import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import { Box, Button, ButtonBase, IconButton, Paper, Typography } from '@mui/material';
import { Input } from 'components/FormStandard/Input';
import Loader from 'components/Loader';
import { SubmitButton } from 'components/SubmitButton';
import { useMemo, useState, type FC } from 'react';
import styled from 'styled-components';
import { calculateTimeDifference, generateWeekArray, getDate } from 'utils/date';
import { ProjectSelect } from '../../../components/Forms/Selects/ProjectSelect';
import { useTimesheet } from '../hooks/useTimesheet';
import { CommentModal } from './CommentModal';

/**
 * Phone timesheet: one day on screen at a time behind a 7-day strip, so a
 * day's hours are entered and read without scrolling past the whole week.
 * The strip doubles as the week overview — hours per day at a glance, a
 * red dot where validation failed — and a sticky bar keeps the week total
 * and Save always in reach.
 */

const minutesToClock = (totalMinutes: number) =>
  `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`;

/* ----------------------------- Day strip ---------------------------- */

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
    padding: 0.4rem 0;
    position: relative;
  }
`;

const ErrorDot = styled.span`
  background: ${({ theme }) => theme.palette.error.main};
  border-radius: 50%;
  height: 7px;
  position: absolute;
  right: 5px;
  top: 5px;
  width: 7px;
`;

/* ----------------------------- Entry card ---------------------------- */

const MobileEntry: FC<{ entryId: string }> = ({ entryId }) => {
  const { entries, errors, updateEntry, deleteEntry } = useTimesheet();
  const entry = entries.find(({ id }) => id === entryId);

  const elapsed = useMemo(
    () => calculateTimeDifference(entry?.startTime, entry?.endTime),
    [entry?.startTime, entry?.endTime]
  );
  if (!entry) return null;

  const fieldError = (field: 'startTime' | 'endTime' | 'projectId') =>
    errors.some((err) => err.id === entry.id && err.type === field);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        pt: 0,
        display: 'grid',
        // One shared grid for both rows, so the time fields line up
        // exactly with the project selector below them.
        gridTemplateColumns: '1fr 1fr 2.75rem',
        gap: 1,
        alignItems: 'center'
      }}
    >
      <Input
        name="startTime"
        label="Start"
        size="small"
        type="time"
        InputLabelProps={{ shrink: true }}
        value={entry.startTime}
        error={fieldError('startTime')}
        onChange={(e) => updateEntry({ id: entry.id, startTime: e.target.value })}
      />
      <Input
        name="endTime"
        label="Finish"
        size="small"
        type="time"
        InputLabelProps={{ shrink: true }}
        value={entry.endTime}
        error={fieldError('endTime')}
        onChange={(e) => updateEntry({ id: entry.id, endTime: e.target.value })}
      />
      {/* Tucked into the card's top-right corner, on the label line. */}
      <IconButton
        aria-label="Delete entry"
        color="error"
        size="small"
        sx={{ justifySelf: 'end', alignSelf: 'start', mr: -0.75, mt: 0.5 }}
        onClick={() => deleteEntry(entry.id)}
      >
        <DeleteOutlineRoundedIcon fontSize="small" />
      </IconButton>

      <Box sx={{ gridColumn: '1 / 3' }}>
        <ProjectSelect
          size="small"
          value={entry.projectId}
          onChange={(projectId) => updateEntry({ id: entry.id, projectId })}
          error={fieldError('projectId')}
        />
      </Box>
      <Typography
        variant="body2"
        textAlign="center"
        sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}
      >
        {elapsed.time}
      </Typography>
    </Paper>
  );
};

/* ----------------------------- The week ---------------------------- */

export const MobileTimesheetWeek: FC = () => {
  const {
    weekStart,
    entries,
    errors,
    notes,
    addEntry,
    copyDay,
    isLoading,
    isSubmitting
  } = useTimesheet();

  const weekArray = generateWeekArray(weekStart);
  const todayIso = getDate().toISODate();

  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = weekArray.find((d) => d.dateFormat.toISODate() === todayIso);
    return (today ?? weekArray[0]).day;
  });
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const dayMinutes = (day: string) =>
    entries
      .filter((entry) => entry.day === day)
      .reduce(
        (acc, entry) =>
          acc + calculateTimeDifference(entry.startTime, entry.endTime).totalMinutes,
        0
      );

  // Days whose entries failed validation get a dot on the strip.
  const errorDays = useMemo(() => {
    const byId = new Map(entries.map((entry) => [entry.id, entry.day]));
    return new Set(errors.map((err) => byId.get(err.id)).filter(Boolean));
  }, [errors, entries]);

  const weekTotal = entries.reduce(
    (acc, entry) =>
      acc + calculateTimeDifference(entry.startTime, entry.endTime).totalMinutes,
    0
  );

  const selected = weekArray.find((d) => d.day === selectedDay) ?? weekArray[0];
  const selectedIndex = weekArray.indexOf(selected);
  const dayEntries = entries.filter((entry) => entry.day === selected.day);
  const previousDay = selectedIndex > 0 ? weekArray[selectedIndex - 1] : null;
  const canCopyPrevious =
    dayEntries.length === 0 &&
    previousDay !== null &&
    entries.some((entry) => entry.day === previousDay.day);
  const hasNote = Boolean(notes.find((note) => note.day === selected.day)?.message);

  return (
    <Box sx={{ display: 'grid', gap: 1.5, pb: 10 }}>
      <Strip>
        {weekArray.map((d) => {
          const minutes = dayMinutes(d.day);
          const isSelected = d.day === selectedDay;
          return (
            <DayChip
              key={d.day}
              $selected={isSelected}
              $isToday={d.dateFormat.toISODate() === todayIso}
              onClick={() => setSelectedDay(d.day)}
              aria-label={`${d.day}, ${minutesToClock(minutes)} hours`}
            >
              {errorDays.has(d.day) && <ErrorDot />}
              <Typography variant="caption" sx={{ opacity: 0.75, lineHeight: 1.2 }}>
                {d.day.slice(0, 3)}
              </Typography>
              <Typography fontWeight={800} sx={{ lineHeight: 1.2 }}>
                {d.date}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1.3,
                  opacity: minutes > 0 ? 0.9 : 0.35
                }}
              >
                {minutes > 0 ? minutesToClock(minutes) : '·'}
              </Typography>
            </DayChip>
          );
        })}
      </Strip>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {selected.day} {selected.date}
          {selected.ordinal} {selected.month}
        </Typography>
        {dayEntries.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {minutesToClock(dayMinutes(selected.day))}
          </Typography>
        )}
        <IconButton
          aria-label={hasNote ? 'Edit note' : 'Add note'}
          color={hasNote ? 'success' : 'default'}
          onClick={() => setIsCommentModalOpen(true)}
        >
          <MessageRoundedIcon sx={{ width: 20, height: 20 }} />
        </IconButton>
      </Box>

      {isLoading ? (
        <Loader />
      ) : (
        <Box sx={{ display: 'grid', gap: 1 }}>
          {dayEntries.map((entry) => (
            <MobileEntry key={entry.id} entryId={entry.id} />
          ))}
          {dayEntries.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hours on {selected.day} yet.
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addEntry(selected.day)}
            >
              Add entry
            </Button>
            {canCopyPrevious && (
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<ContentCopyIcon />}
                sx={{ color: 'text.secondary' }}
                onClick={() => copyDay(previousDay.day, selected.day)}
              >
                Same as {previousDay.day.slice(0, 3)}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Week total + Save, always in reach. Inside the <form>, so the
          button submits the whole week exactly like the desktop buttons. */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1100,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            Week total
          </Typography>
          <Typography
            fontWeight={800}
            sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
          >
            {minutesToClock(weekTotal)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <SubmitButton isLoading={isSubmitting} />
      </Paper>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        day={selected.day}
      />
    </Box>
  );
};
