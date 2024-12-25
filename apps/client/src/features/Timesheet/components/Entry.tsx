import { Button } from 'components/Button';
import { Input } from 'components/FormStandard/Input';
import { type FC, useMemo } from 'react';
import { calculateTimeDifference } from 'utils/date';
import { useTimesheet } from '../hooks/useTimesheet';
import { ProjectSelect } from './ProjectSelect';

export const Entry: FC<{ entryId: string }> = ({ entryId }) => {
  const { entries, updateEntry, deleteEntry } = useTimesheet();
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
    <div>
      <Input
        name="startTime"
        value={entry.startTime}
        onChange={(e) => updateEntry({ id: entry.id, startTime: e.target.value })}
        type="time"
      />
      <Input
        name="endTime"
        value={entry.endTime}
        onChange={(e) => updateEntry({ id: entry.id, endTime: e.target.value })}
        type="time"
      />
      <ProjectSelect
        value={entry.projectId}
        onChange={(projectId) =>
          updateEntry({ id: entry.id, projectId: projectId ?? undefined })
        }
      />
      <p>Elapsed Time: {elapsedTime.time} hrs</p>
      <Button onClick={() => deleteEntry(entry.id)}>Delete</Button>
    </div>
  );
};
