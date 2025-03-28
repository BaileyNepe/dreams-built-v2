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

type Segment = {
  segmentStart: DateTime;
  segmentEnd: DateTime;
};

type SegmentWithLane = Segment & {
  // Numeric representation for lane assignment:
  // start: the column (day index relative to startOfWeek)
  // span: number of days it covers (always at least 1)
  start: number;
  span: number;
  lane: number;
};

const getSegmentLanes = (segments: Segment[], weekStart: DateTime): SegmentWithLane[] => {
  // Convert each segment into its numeric form (relative to weekStart)
  const segmentsNumeric: SegmentWithLane[] = segments.map((segment) => {
    // Compute the column index (0-based) for the segmentStart.
    // Using Math.floor in case there are fractional values.
    const start = Math.floor(segment.segmentStart.diff(weekStart, 'days').days);
    // The span is the number of days covered; add 1 since the start day counts.
    const span =
      Math.floor(segment.segmentEnd.diff(segment.segmentStart, 'days').days) + 1;
    return { ...segment, start, span, lane: 0 };
  });

  // Sort segments by their starting column.
  segmentsNumeric.sort((a, b) => a.start - b.start);

  // lanes array holds, for each lane, the next free column (i.e. the end column of the last segment assigned)
  const laneEnds: number[] = [];

  // Assign lanes using a greedy algorithm.
  for (const seg of segmentsNumeric) {
    let assigned = false;
    for (let i = 0; i < laneEnds.length; i++) {
      // If the segment's start is at or after the lane's free column, it fits in this lane.
      if (seg.start >= laneEnds[i]) {
        seg.lane = i;
        laneEnds[i] = seg.start + seg.span; // update the lane's end
        assigned = true;
        break;
      }
    }
    // If no existing lane fits, add a new lane.
    if (!assigned) {
      seg.lane = laneEnds.length;
      laneEnds.push(seg.start + seg.span);
    }
  }

  return segmentsNumeric;
};

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
        // First, sort tasks by their start time.
        const sortedTasks = jp.projectSchedule
          .map((t) => ({
            ...t,
            start: getDate(t.startDate),
            end: getDate(t.endDate)
          }))
          .sort((a, b) => a.start.toMillis() - b.start.toMillis());

        // (Optional) Assign lanes to tasks if you need to display them separately.
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

        // Compute segments for each task, skipping blocked days.
        const tasksWithSegments = tasksWithLanes.map((task) => {
          const segments: Segment[] = [];
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

          // Now apply lane assignment to the segments.
          // Each segment’s "start" becomes its column (day) relative to the week and "span" is its width in days.
          const segmentsWithLanes = getSegmentLanes(segments, startOfWeek);
          return { ...task, segments: segmentsWithLanes };
        });

        return { ...jp, tasks: tasksWithSegments };
      }),
    [scheduleData, startOfWeek, endOfWeek, blockedDays]
  );

  // Compute an array of dates to display for the week.
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
