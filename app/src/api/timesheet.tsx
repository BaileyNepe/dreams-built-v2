import { api } from 'trpc/react'

export const useTimesheetEntries = ({
  weekStart,
  userId,
}: {
  weekStart: string
  userId?: string
}) =>
  api.timesheet.get.useSuspenseQuery({
    weekStart,
    userId,
  })[0]
