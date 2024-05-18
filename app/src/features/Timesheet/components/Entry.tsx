import { Button } from 'components/Button'
import { Input } from 'components/Form/Input'
import { type FC, useMemo } from 'react'
import { calculateTimeDifference } from 'utils/date'
import { useTimesheet } from '../hooks/useTimesheet'
import ProjectSelect from './ProjectSelect'

const Entry: FC<{ entryId: string }> = ({ entryId }) => {
  const { entries, updateEntry, deleteEntry } = useTimesheet()
  const entry = useMemo(() => {
    const result = entries.find(({ id }) => id === entryId)
    if (!result) {
      throw new Error(`Entry with id ${entryId} not found`)
    }
    return result
  }, [entries, entryId])

  const elapsedTime = useMemo(
    () => calculateTimeDifference(entry.startTime, entry.endTime),
    [entry.startTime, entry.endTime],
  )

  return (
    <div>
      Entry {entry.id}
      <Input
        name="startTime"
        value={entry.startTime}
        onChange={(e) =>
          updateEntry({ id: entry.id, startTime: e.target.value })
        }
        label="Start Time"
        type="time"
      />
      <Input
        name="endTime"
        value={entry.endTime}
        onChange={(e) => updateEntry({ id: entry.id, endTime: e.target.value })}
        label="End Time"
        type="time"
      />
      <ProjectSelect
        name="projectId"
        label="Project"
        value={entry.projectId}
        onChange={(projectId) => updateEntry({ id: entry.id, projectId })}
      />
      <p>Elapsed Time: {elapsedTime.time} hrs</p>
      <Button color="slate" onClick={() => deleteEntry(entry.id)}>
        Delete
      </Button>
    </div>
  )
}

export default Entry
