import PlusIcon from '@mui/icons-material/Add';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import { IconButton, Typography } from '@mui/material';
import { Button } from 'components/Button';
import { useMemo, type FC } from 'react';
import styled from 'styled-components';
import { calculateTimeDifference } from 'utils/date';
import { useResponsive } from 'utils/hooks/useResponsive';
import { useTimesheet } from '../hooks/useTimesheet';
import { Entry, timesheetTemplateColumns } from './Entry';

const Header = styled.div`
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

const Footer = styled.div`
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

const Body = styled.div`
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 0;

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    gap: 1rem;
  }
`;

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

export const TimesheetDay: FC<{
  day: string;
  date: string;
  ordinal: string;
  month: string;
}> = ({ day, ordinal, month, date }) => {
  const { entries, addEntry, notes } = useTimesheet();
  const isDesktop = useResponsive('up', 'md');

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === day),
    [entries, day]
  );

  const todayNotes = useMemo(() => notes.find((note) => note.day === day), [notes, day]);

  const totalTime = useMemo(() => {
    const totalMinutes = dayEntries.reduce((acc, entry) => {
      const time = calculateTimeDifference(entry.startTime, entry.endTime);
      return acc + time.totalMinutes;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }, [dayEntries]);

  return (
    <Container>
      <CardHeader>
        <Typography variant="h5" component="h2">
          {day} - {date}
          <sup>{ordinal}</sup> {month}
        </Typography>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <IconButton
            aria-label="add note"
            color={todayNotes?.message ? 'success' : 'default'}
          >
            <MessageRoundedIcon
              sx={{
                height: 18,
                width: 18
              }}
            />
          </IconButton>
          {isDesktop && (
            <Button onClick={() => addEntry(day)} startIcon={<PlusIcon />}>
              Add Entry
            </Button>
          )}
        </div>
      </CardHeader>
      {!!dayEntries.length && isDesktop && (
        <Header>
          <span>Start Time</span>
          <span>End Time</span>
          <span>Project</span>
          <span />
          <span />
        </Header>
      )}
      <Body>
        {dayEntries.map((entry) => (
          <Entry key={entry.id} entryId={entry.id} />
        ))}
      </Body>
      {!!dayEntries.length && (
        <Footer>
          <span />
          <span />
          <span>
            <strong>Total</strong>
          </span>
          <span style={{ textAlign: 'right' }}>{totalTime}</span>
          <span />
        </Footer>
      )}
      {!isDesktop && (
        <Button onClick={() => addEntry(day)} startIcon={<PlusIcon />} fullWidth>
          Add Entry
        </Button>
      )}
    </Container>
  );
};
