import { type FC } from 'react'
import { generateWeekArray } from 'utils/date'
import { useTimesheet } from '../hooks/useTimesheet'
import TimesheetDay from './Day'

const TimesheetWeek: FC = () => {
  const { weekStart } = useTimesheet()
  const weekArray = generateWeekArray(weekStart)

  return (
    <>
      {weekArray.map((date) => (
        <TimesheetDay key={date.date} {...date} />
      ))}
    </>
  )
}

export default TimesheetWeek
