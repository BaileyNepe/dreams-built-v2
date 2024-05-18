import { Button } from 'components/Button'
import { useMemo, type FC } from 'react'
import { useTimesheet } from '../hooks/useTimesheet'
import Entry from './Entry'

const TimesheetDay: FC<{
  day: string
  date: string
  ordinal: string
  month: string
}> = ({ day, ordinal, month, date }) => {
  const { entries, addEntry } = useTimesheet()

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === day),
    [entries, day],
  )

  return (
    <div>
      <h2>
        {day} - {date}
        <sup>{ordinal}</sup> {month}
      </h2>
      <Button onClick={() => addEntry(day)}>Add Entry</Button>
      {dayEntries.map((entry) => (
        <Entry key={entry.id} entryId={entry.id} />
      ))}
    </div>
  )
}

export default TimesheetDay
