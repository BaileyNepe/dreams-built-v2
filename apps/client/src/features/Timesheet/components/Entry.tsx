import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Button } from 'components/Button';
import { Input } from 'components/FormStandard/Input';
import { type FC, useMemo } from 'react';
import styled from 'styled-components';
import { calculateTimeDifference } from 'utils/date';
import { useResponsive } from 'utils/hooks/useResponsive';
import { ProjectSelect } from '../../../components/Forms/Selects/ProjectSelect';
import { useTimesheet } from '../hooks/useTimesheet';

export const timesheetTemplateColumns = '1fr 1fr 3fr 3rem 4rem';

const Container = styled.div`
  align-items: center;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: ${timesheetTemplateColumns};

  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    grid-template-columns: 1fr;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.palette.grey[300]};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    button {
      margin-top: 1rem;
    }
  }
`;

const Time = styled.p`
  margin: 0;
  text-align: right;
`;

export const Entry: FC<{ entryId: string }> = ({ entryId }) => {
  const { entries, errors, updateEntry, deleteEntry } = useTimesheet();
  const isDesktop = useResponsive('up', 'md');

  // Find the entry
  const entry = useMemo(() => {
    const found = entries.find(({ id }) => id === entryId);
    if (!found) {
      throw new Error(`Entry with id ${entryId} not found`);
    }
    return found;
  }, [entries, entryId]);

  // Compute elapsed time
  const elapsedTime = useMemo(
    () => calculateTimeDifference(entry.startTime, entry.endTime),
    [entry.startTime, entry.endTime]
  );

  // Helper to get a specific error (if any) for the given field
  const getFieldError = (field: 'startTime' | 'endTime' | 'projectId') =>
    errors.find((err) => err.id === entry.id && err.type === field)?.message;

  return (
    <Container>
      <Input
        name="startTime"
        value={entry.startTime}
        onChange={(e) => updateEntry({ id: entry.id, startTime: e.target.value })}
        type="time"
        hasLabel={!isDesktop}
        error={Boolean(getFieldError('startTime'))}
      />
      <Input
        name="endTime"
        value={entry.endTime}
        onChange={(e) => updateEntry({ id: entry.id, endTime: e.target.value })}
        type="time"
        hasLabel={!isDesktop}
        error={Boolean(getFieldError('endTime'))}
      />
      <ProjectSelect
        label={!isDesktop ? 'Select Project' : undefined}
        value={entry.projectId}
        onChange={(projectId) => updateEntry({ id: entry.id, projectId })}
        error={Boolean(getFieldError('projectId'))}
      />
      {isDesktop && <Time>{elapsedTime.time}</Time>}
      <Button
        color="error"
        onClick={() => deleteEntry(entry.id)}
        variant={isDesktop ? 'text' : 'outlined'}
        startIcon={isDesktop ? undefined : <DeleteOutlineRoundedIcon />}
      >
        {isDesktop ? <DeleteOutlineRoundedIcon /> : 'Delete'}
      </Button>
    </Container>
  );
};
