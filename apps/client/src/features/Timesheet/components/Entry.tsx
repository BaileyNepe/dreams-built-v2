import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Button } from 'components/Button';
import { Input } from 'components/FormStandard/Input';
import { type FC, useMemo } from 'react';
import styled from 'styled-components';
import { calculateTimeDifference } from 'utils/date';
import { useResponsive } from 'utils/hooks/useResponsive';
import { useTimesheet } from '../hooks/useTimesheet';
import { ProjectSelect } from './ProjectSelect';

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
    /* background-color: ${({ theme }) => theme.palette.grey[200]}; */
  }
`;

const Time = styled.p`
  margin: 0;
  text-align: right;
`;

export const Entry: FC<{ entryId: string }> = ({ entryId }) => {
  const { entries, updateEntry, deleteEntry } = useTimesheet();
  const isDesktop = useResponsive('up', 'md');
  const entry = useMemo(() => {
    const result = entries.find(({ id }) => id === entryId);
    if (!result) {
      throw new Error(`Entry with id ${entryId} not found`);
    }
    return result;
  }, [entries, entryId]);

  const elapsedTime = useMemo(
    () => calculateTimeDifference(entry.startTime, entry.endTime),
    [entry.startTime, entry.endTime]
  );

  return (
    <Container>
      <Input
        name="startTime"
        value={entry.startTime}
        onChange={(e) => updateEntry({ id: entry.id, startTime: e.target.value })}
        type="time"
        hasLabel={!isDesktop}
      />
      <Input
        name="endTime"
        value={entry.endTime}
        onChange={(e) => updateEntry({ id: entry.id, endTime: e.target.value })}
        type="time"
        hasLabel={!isDesktop}
      />
      <ProjectSelect
        label={!isDesktop ? 'Select Project' : undefined}
        value={entry.projectId}
        onChange={(projectId) => updateEntry({ id: entry.id, projectId })}
      />
      <Time>{elapsedTime.time}</Time>
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
