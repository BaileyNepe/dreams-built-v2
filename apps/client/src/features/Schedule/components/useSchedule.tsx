import { authz } from '@dreams-built/shared/src/auth/permissions';
import { useScheduleQuery } from 'api/schedule';
import { type DateTime } from 'luxon';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode
} from 'react';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate, generateWeekArray, getDate, isMatchingDates } from 'utils/date';

const useSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(getDate());
  const startOfWeek = useMemo(() => selectedDate.startOf('week'), [selectedDate]);
  const endOfWeek = useMemo(() => selectedDate.endOf('week'), [selectedDate]);

  const hasPermissionToEdit = useAuth().user.permissions.some(
    (p) => p === authz.schedule_edit
  );

  const scheduleData = useScheduleQuery(formatDate(startOfWeek), formatDate(endOfWeek));

  // Convert raw blocked days to DateTime objects
  const blockedDays = useMemo(
    () => scheduleData.blockedDays.map((d) => getDate(d.date)),
    [scheduleData]
  );

  const projectPartsWithSegments = useMemo(
    () =>
      scheduleData.schedule.map((jp) => {
        const sortedTasks = jp.projectSchedule
          .map((t) => ({
            ...t,
            start: getDate(t.startDate),
            end: getDate(t.endDate)
          }))
          .slice()
          .sort((a, b) => a.start.toMillis() - b.start.toMillis());
        const laneEndTimes: DateTime[] = [];
        const tasksWithLanes = sortedTasks.map((task) => {
          let laneIndex = 0;
          while (
            laneIndex < laneEndTimes.length &&
            task.start.toMillis() <= laneEndTimes[laneIndex].toMillis()
          ) {
            laneIndex++;
          }
          if (laneIndex >= laneEndTimes.length) {
            laneEndTimes.push(task.end);
          } else {
            laneEndTimes[laneIndex] = task.end;
          }
          return { ...task, lane: laneIndex };
        });

        // Compute segments for each task, skipping blocked days
        const tasksWithSegments = tasksWithLanes.map((task) => {
          const segments: { segmentStart: DateTime; segmentEnd: DateTime }[] = [];
          const effectiveStart = task.start > startOfWeek ? task.start : startOfWeek;
          const effectiveEnd = task.end < endOfWeek ? task.end : endOfWeek;
          let currentSegmentStart: DateTime | null = null;
          let iterDate = effectiveStart.startOf('day');

          while (iterDate <= effectiveEnd) {
            const currentIter = iterDate;
            if (!isMatchingDates(currentIter, blockedDays)) {
              if (!currentSegmentStart) currentSegmentStart = currentIter;
            } else if (currentSegmentStart) {
              segments.push({
                segmentStart: currentSegmentStart,
                segmentEnd: currentIter.minus({ days: 1 }).endOf('day')
              });
              currentSegmentStart = null;
            }
            iterDate = iterDate.plus({ days: 1 }).startOf('day');
          }
          if (currentSegmentStart) {
            segments.push({
              segmentStart: currentSegmentStart,
              segmentEnd: effectiveEnd
            });
          }
          return { ...task, segments };
        });

        return { ...jp, tasks: tasksWithSegments };
      }),
    [scheduleData, startOfWeek, endOfWeek, blockedDays]
  );

  // Compute an array of dates to display for the week
  const datesToShow = useMemo(
    () => generateWeekArray(formatDate(startOfWeek)).map((d) => d.dateFormat),
    [startOfWeek]
  );

  const changeDate = (date: string) => {
    setSelectedDate(getDate(date));
  };

  return {
    changeDate,
    hasPermissionToEdit,
    selectedDate,
    blockedDays,
    projectPartsWithSegments,
    datesToShow,
    startOfWeek,
    endOfWeek
  };
};

type ScheduleContextType = ReturnType<typeof useSchedule>;

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export type ProjectPart = ScheduleContextType['projectPartsWithSegments'][number];
export type Task = ScheduleContextType['projectPartsWithSegments'][0]['tasks'][number];

export const ScheduleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const schedule = useSchedule();
  return <ScheduleContext.Provider value={schedule}>{children}</ScheduleContext.Provider>;
};

export const useScheduler = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduler must be used within a ScheduleProvider');
  }
  return context;
};
