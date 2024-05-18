import TimesheetForm from 'features/Timesheet'
import { TimesheetProvider } from 'features/Timesheet/hooks/useTimesheet'

const Timesheet = () => (
  <TimesheetProvider>
    <TimesheetForm />
  </TimesheetProvider>
)

export default Timesheet
