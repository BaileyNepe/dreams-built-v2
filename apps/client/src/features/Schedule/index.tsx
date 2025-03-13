import { Box, useMediaQuery, useTheme } from '@mui/material';
import React, { type FC, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ScheduleHeader } from './ScheduleHeader';

// ----- Types -----
type Task = {
  id: number;
  name: string;
  startDate: string; // e.g. "2025-03-10"
  endDate: string; // e.g. "2025-03-12"
  color: string;
};

type TaskWithDates = Task & {
  start: Date;
  end: Date;
};

type JobPart = {
  id: number;
  name: string;
  tasks: Task[];
};

type LaneTask = TaskWithDates & {
  lane: number;
};

// ----- Sample Data -----
const initialJobParts: JobPart[] = [
  {
    id: 1,
    name: 'Part A',
    tasks: [
      {
        id: 101,
        name: 'Task A1 ',
        startDate: '2025-03-10',
        endDate: '2025-03-10',
        color: 'lightgreen'
      },
      {
        id: 102,
        name: 'Task A2',
        startDate: '2025-03-11',
        endDate: '2025-03-15',
        color: 'lightblue'
      }
    ]
  },
  {
    id: 2,
    name: 'Part B',
    tasks: [
      {
        id: 201,
        name: 'Task B1',
        startDate: '2025-03-09',
        endDate: '2025-03-10',
        color: 'salmon'
      },
      {
        id: 202,
        name: 'Task B2',
        startDate: '2025-03-13',
        endDate: '2025-03-17',
        color: 'khaki'
      }
    ]
  }
];

// ----- Configurable Blocked Days -----
const blockedDays: string[] = ['2025-03-13', '2025-03-15'];

// ----- Date Utilities -----
const toDate = (iso: string, isEnd: boolean = false): Date => {
  const d = new Date(iso);
  if (isEnd) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfWeek = (startOfWeek: Date): Date => {
  const d = new Date(startOfWeek);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getDates = (start: Date, days: number): Date[] =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

const isBlocked = (date: Date): boolean => {
  const iso = date.toISOString().slice(0, 10);
  return blockedDays.includes(iso);
};

// ----- Compute Task Segments -----
const computeTaskSegments = (
  task: LaneTask,
  startOfWeek: Date,
  endOfWeek: Date
): { segmentStart: Date; segmentEnd: Date }[] => {
  const segments: { segmentStart: Date; segmentEnd: Date }[] = [];
  const effectiveStart = new Date(Math.max(task.start.getTime(), startOfWeek.getTime()));
  const effectiveEnd = new Date(Math.min(task.end.getTime(), endOfWeek.getTime()));
  let currentSegmentStart: Date | null = null;
  const iterDate = new Date(effectiveStart);
  while (iterDate.getTime() <= effectiveEnd.getTime()) {
    const currentDay = new Date(iterDate);
    currentDay.setHours(0, 0, 0, 0);
    if (!isBlocked(currentDay)) {
      if (!currentSegmentStart) {
        currentSegmentStart = new Date(currentDay);
      }
    } else if (currentSegmentStart) {
      const segmentEnd = new Date(currentDay.getTime() - 1);
      segments.push({ segmentStart: currentSegmentStart, segmentEnd });
      currentSegmentStart = null;
    }
    iterDate.setDate(iterDate.getDate() + 1);
  }
  if (currentSegmentStart) {
    segments.push({ segmentStart: currentSegmentStart, segmentEnd: effectiveEnd });
  }
  return segments;
};

// ----- Lanes: separate overlapping tasks -----
const assignTaskLanes = (tasks: TaskWithDates[]): LaneTask[] => {
  const sorted = tasks.slice().sort((a, b) => a.start.getTime() - b.start.getTime());
  const laneEndTimes: Date[] = [];
  const result: LaneTask[] = [];
  for (const t of sorted) {
    let laneIndex = 0;
    while (
      laneIndex < laneEndTimes.length &&
      t.start.getTime() <= laneEndTimes[laneIndex].getTime()
    ) {
      laneIndex++;
    }
    if (laneIndex >= laneEndTimes.length) {
      laneEndTimes.push(t.end);
    } else {
      laneEndTimes[laneIndex] = t.end;
    }
    result.push({ ...t, lane: laneIndex });
  }
  return result;
};

// ----- Position Calculations -----
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateToPercent = (date: Date, startOfWeek: Date, endOfWeek: Date) => {
  const totalRange = endOfWeek.getTime() - startOfWeek.getTime();
  const offset = date.getTime() - startOfWeek.getTime();
  const pct = (offset / totalRange) * 100;
  return Math.max(0, Math.min(pct, 100));
};

const getBarPosition = (
  barStart: Date,
  barEnd: Date,
  startOfWeek: Date,
  endOfWeek: Date
) => {
  const leftPct = dateToPercent(barStart, startOfWeek, endOfWeek);
  const rightPct = dateToPercent(barEnd, startOfWeek, endOfWeek);
  const widthPct = Math.max(0, rightPct - leftPct);
  return { left: `${leftPct}%`, width: `${widthPct}%` };
};

// ----- Resizing & Moving State -----
type DragState = {
  jobPartId: number;
  taskId: number;
  originalStartMs: number;
  originalEndMs: number;
  startX: number;
  previewDayDelta: number;
} | null;

type ResizeState = {
  jobPartId: number;
  taskId: number;
  originalStartMs: number;
  originalEndMs: number;
  startX: number;
  isResizingLeft: boolean;
  previewDayDelta: number;
} | null;

type CreateState = {
  jobPartId: number;
  startX: number;
  currentX: number;
} | null;

// ----- Styled Components -----
// (Vertical borders have been removed from DayCell and UnderlayCell)
const Container = styled(Box)`
  padding: 16px;
`;

const JobPartCell = styled(Box)`
  align-items: center;
  border-bottom: 1px solid #ccc;
  /* Removed vertical border */
  display: flex;
  padding: 8px;
`;

const ScheduleRow = styled(Box)<{ minHeight: string }>`
  border-bottom: 1px solid #ccc;
  min-height: ${({ minHeight }) => minHeight};
  position: relative;
`;

// Update UnderlayGrid to use a prop instead of hard-coding 7
const UnderlayGrid = styled(Box)<{ daysToShow: number }>`
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(${({ daysToShow }) => daysToShow}, 1fr);
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const UnderlayCell = styled(Box)<{ blocked?: boolean }>`
  background-color: ${({ blocked }) => (blocked ? '#f0f0f0' : 'transparent')};
  /* Vertical borders removed */
`;

const TaskBar = styled(Box)<{
  top: string;
  left: string;
  width: string;
  backgroundColor: string;
  opacity?: number;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  border: 1px solid #888;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: grab;
  font-size: 0.8rem;
  height: 24px;
  left: ${({ left }) => left};
  opacity: ${({ opacity }) => opacity ?? 1};
  overflow: hidden;
  padding: 2px;
  position: absolute;
  text-overflow: ellipsis;
  top: ${({ top }) => top};
  white-space: nowrap;
  width: ${({ width }) => width};
`;

const PreviewBar = styled(Box)<{ top: string; left: string; width: string }>`
  background-color: #d3d3d3;
  border: 1px dashed #666;
  border-radius: 4px;
  box-sizing: border-box;
  height: 24px;
  left: ${({ left }) => left};
  opacity: 0.5;
  padding: 2px;
  position: absolute;
  top: ${({ top }) => top};
  width: ${({ width }) => width};
`;

// ----- Main Component -----
export const Schedule: FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2025-03-12'));
  const [jobParts, setJobParts] = useState<JobPart[]>(initialJobParts);
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // For moving, resizing, creating tasks:
  const [draggingTask, setDraggingTask] = useState<DragState>(null);
  const [resizingTask, setResizingTask] = useState<ResizeState>(null);
  const [creatingTask, setCreatingTask] = useState<CreateState>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const daysToShow = isSmallScreen ? 1 : 7;

  const startOfWeek = useMemo(() => getStartOfWeek(selectedDate), [selectedDate]);
  // For day view, we'll use the selected date instead of the week start.
  const effectiveStart = isSmallScreen ? selectedDate : startOfWeek;
  const endOfWeek = useMemo(
    () => (isSmallScreen ? selectedDate : getEndOfWeek(startOfWeek)),
    [isSmallScreen, selectedDate, startOfWeek]
  );
  const datesToShow = useMemo(
    () => (isSmallScreen ? [selectedDate] : getDates(startOfWeek, daysToShow)),
    [isSmallScreen, selectedDate, startOfWeek, daysToShow]
  );

  const jobPartsWithDates = useMemo(
    () =>
      jobParts.map((jp) => {
        const tasks = jp.tasks.map((t) => ({
          ...t,
          start: toDate(t.startDate),
          end: toDate(t.endDate, true)
        }));
        const tasksWithLanes = assignTaskLanes(tasks);
        return { ...jp, tasks: tasksWithLanes };
      }),
    [jobParts]
  );

  // ----- Mouse Handlers (Moving, Resizing, Creating) -----
  const handleTaskMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    jobPartId: number,
    taskId: number,
    originalStart: Date,
    originalEnd: Date
  ) => {
    e.stopPropagation();
    const rowEl = rowRefs.current[jobPartId];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    setDraggingTask({
      jobPartId,
      taskId,
      originalStartMs: originalStart.getTime(),
      originalEndMs: originalEnd.getTime(),
      startX: e.clientX - rect.left,
      previewDayDelta: 0
    });
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    jobPartId: number,
    taskId: number,
    originalStart: Date,
    originalEnd: Date,
    isResizingLeft: boolean
  ) => {
    e.stopPropagation();
    const rowEl = rowRefs.current[jobPartId];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    setResizingTask({
      jobPartId,
      taskId,
      originalStartMs: originalStart.getTime(),
      originalEndMs: originalEnd.getTime(),
      startX: e.clientX - rect.left,
      isResizingLeft,
      previewDayDelta: 0
    });
  };

  const handleRowMouseDown = (e: React.MouseEvent<HTMLDivElement>, jobPartId: number) => {
    e.stopPropagation();
    const rowEl = rowRefs.current[jobPartId];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    setCreatingTask({
      jobPartId,
      startX: e.clientX - rect.left,
      currentX: e.clientX - rect.left
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingTask) {
      const rowEl = rowRefs.current[draggingTask.jobPartId];
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const deltaX = currentX - draggingTask.startX;
      const pxPerDay = rect.width / daysToShow;
      const dayDelta = Math.round(deltaX / pxPerDay);
      setDraggingTask({ ...draggingTask, previewDayDelta: dayDelta });
    }
    if (resizingTask) {
      const rowEl = rowRefs.current[resizingTask.jobPartId];
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const deltaX = currentX - resizingTask.startX;
      const pxPerDay = rect.width / daysToShow;
      let dayDelta = 0;
      if (resizingTask.isResizingLeft) {
        dayDelta =
          deltaX > 0 ? Math.floor(deltaX / pxPerDay) : Math.ceil(deltaX / pxPerDay);
      } else {
        dayDelta =
          deltaX > 0 ? Math.ceil(deltaX / pxPerDay) : Math.floor(deltaX / pxPerDay);
      }
      setResizingTask({ ...resizingTask, previewDayDelta: dayDelta });
    }
    if (creatingTask) {
      const rowEl = rowRefs.current[creatingTask.jobPartId];
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      setCreatingTask({ ...creatingTask, currentX });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingTask) {
      const { jobPartId, taskId, originalStartMs, originalEndMs, previewDayDelta } =
        draggingTask;
      const newStartMs = originalStartMs + previewDayDelta * MS_PER_DAY;
      const newEndMs = originalEndMs + previewDayDelta * MS_PER_DAY;
      setJobParts((prev) =>
        prev.map((jp) => {
          if (jp.id !== jobPartId) return jp;
          return {
            ...jp,
            tasks: jp.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const newStartDate = new Date(newStartMs);
              const newEndDate = new Date(newEndMs);
              return {
                ...t,
                startDate: newStartDate.toISOString().slice(0, 10),
                endDate: newEndDate.toISOString().slice(0, 10)
              };
            })
          };
        })
      );
      setDraggingTask(null);
    }
    if (resizingTask) {
      const {
        jobPartId,
        taskId,
        originalStartMs,
        originalEndMs,
        previewDayDelta,
        isResizingLeft
      } = resizingTask;
      let newStartMs = originalStartMs;
      let newEndMs = originalEndMs;
      if (isResizingLeft) {
        newStartMs = originalStartMs + previewDayDelta * MS_PER_DAY;
        const tentative = new Date(newStartMs);
        while (isBlocked(tentative) && tentative < new Date(newEndMs)) {
          tentative.setTime(tentative.getTime() + MS_PER_DAY);
        }
        newStartMs = tentative.getTime();
      } else {
        newEndMs = originalEndMs + previewDayDelta * MS_PER_DAY;
        const tentative = new Date(newEndMs);
        while (isBlocked(tentative) && tentative > new Date(newStartMs)) {
          tentative.setTime(tentative.getTime() - MS_PER_DAY);
        }
        newEndMs = tentative.getTime();
      }
      setJobParts((prev) =>
        prev.map((jp) => {
          if (jp.id !== jobPartId) return jp;
          return {
            ...jp,
            tasks: jp.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const newStartDate = new Date(newStartMs);
              const newEndDate = new Date(newEndMs);
              return {
                ...t,
                startDate: newStartDate.toISOString().slice(0, 10),
                endDate: newEndDate.toISOString().slice(0, 10)
              };
            })
          };
        })
      );
      setResizingTask(null);
    }
    if (creatingTask) {
      const rowEl = rowRefs.current[creatingTask.jobPartId];
      if (!rowEl) return;
      const rect = rowEl.getBoundingClientRect();
      const pxPerDay = rect.width / daysToShow;
      const diffPx = creatingTask.currentX - creatingTask.startX;
      if (Math.abs(diffPx) > 5) {
        const offsetStartDays = Math.floor(creatingTask.startX / pxPerDay);
        const offsetEndDays = Math.floor(creatingTask.currentX / pxPerDay);
        const realStartDay = Math.min(offsetStartDays, offsetEndDays);
        const realEndDay = Math.max(offsetStartDays, offsetEndDays);
        const newStart = new Date(effectiveStart);
        newStart.setDate(effectiveStart.getDate() + realStartDay);
        const newEnd = new Date(effectiveStart);
        newEnd.setDate(effectiveStart.getDate() + realEndDay);
        setJobParts((prev) =>
          prev.map((jp) => {
            if (jp.id !== creatingTask.jobPartId) return jp;
            const newId = Math.floor(Math.random() * 1000000);
            const newTask: Task = {
              id: newId,
              name: `New Task ${newId}`,
              startDate: newStart.toISOString().slice(0, 10),
              endDate: newEnd.toISOString().slice(0, 10),
              color: '#d3d3d3'
            };
            return { ...jp, tasks: [...jp.tasks, newTask] };
          })
        );
      }
      setCreatingTask(null);
    }
  };

  return (
    <Container onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <ScheduleHeader
        daysToShow={daysToShow}
        datesToShow={datesToShow}
        isBlocked={isBlocked}
      />

      <Box display="grid" gridTemplateColumns="200px 1fr">
        {jobPartsWithDates.map((jp) => {
          const maxLane = Math.max(...jp.tasks.map((t) => t.lane), 0);
          const rowHeight = (maxLane + 1) * 30 + 20;
          return (
            <React.Fragment key={jp.id}>
              <JobPartCell height={`${rowHeight}px`}>{jp.name}</JobPartCell>
              <ScheduleRow
                ref={(el: HTMLDivElement | null) => {
                  rowRefs.current[jp.id] = el;
                }}
                minHeight={`${rowHeight}px`}
                onMouseDown={(e) => handleRowMouseDown(e, jp.id)}
              >
                <UnderlayGrid daysToShow={daysToShow}>
                  {datesToShow.map((day, idx) => (
                    <UnderlayCell key={idx} blocked={isBlocked(day)} />
                  ))}
                </UnderlayGrid>
                {jp.tasks.map((t) => {
                  let previewStart = t.start;
                  let previewEnd = t.end;
                  if (
                    draggingTask &&
                    draggingTask.jobPartId === jp.id &&
                    draggingTask.taskId === t.id
                  ) {
                    previewStart = new Date(
                      t.start.getTime() + draggingTask.previewDayDelta * MS_PER_DAY
                    );
                    previewEnd = new Date(
                      t.end.getTime() + draggingTask.previewDayDelta * MS_PER_DAY
                    );
                  }
                  if (
                    resizingTask &&
                    resizingTask.jobPartId === jp.id &&
                    resizingTask.taskId === t.id
                  ) {
                    if (resizingTask.isResizingLeft) {
                      previewStart = new Date(
                        t.start.getTime() + resizingTask.previewDayDelta * MS_PER_DAY
                      );
                    } else {
                      previewEnd = new Date(
                        t.end.getTime() + resizingTask.previewDayDelta * MS_PER_DAY
                      );
                    }
                  }
                  const segments = computeTaskSegments(
                    { ...t, start: previewStart, end: previewEnd },
                    effectiveStart,
                    endOfWeek
                  );
                  return segments.map((seg, idx) => {
                    const { left, width } = getBarPosition(
                      seg.segmentStart,
                      seg.segmentEnd,
                      effectiveStart,
                      endOfWeek
                    );
                    const top = 8 + t.lane * 30;
                    return (
                      <TaskBar
                        key={`${t.id}-${idx}`}
                        top={`${top}px`}
                        left={left}
                        width={width}
                        backgroundColor={t.color}
                        opacity={
                          draggingTask && draggingTask.taskId === t.id
                            ? 0.7
                            : resizingTask && resizingTask.taskId === t.id
                              ? 0.7
                              : 1
                        }
                        title={t.name}
                        onMouseDown={(e) =>
                          handleTaskMouseDown(e, jp.id, t.id, t.start, t.end)
                        }
                      >
                        {t.name}
                        <Box
                          component="div"
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '8px',
                            height: '100%',
                            cursor: 'ew-resize'
                          }}
                          onMouseDown={(e) =>
                            handleResizeMouseDown(e, jp.id, t.id, t.start, t.end, true)
                          }
                        />
                        <Box
                          component="div"
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: '8px',
                            height: '100%',
                            cursor: 'ew-resize'
                          }}
                          onMouseDown={(e) =>
                            handleResizeMouseDown(e, jp.id, t.id, t.start, t.end, false)
                          }
                        />
                      </TaskBar>
                    );
                  });
                })}
                {creatingTask &&
                  creatingTask.jobPartId === jp.id &&
                  (() => {
                    const rowEl = rowRefs.current[jp.id];
                    if (!rowEl) return null;
                    const rect = rowEl.getBoundingClientRect();
                    const pxPerDay = rect.width / daysToShow;
                    const offsetStartDays = Math.floor(creatingTask.startX / pxPerDay);
                    const offsetEndDays = Math.floor(creatingTask.currentX / pxPerDay);
                    const realStartDay = Math.min(offsetStartDays, offsetEndDays);
                    const realEndDay = Math.max(offsetStartDays, offsetEndDays);
                    const newStart = new Date(effectiveStart);
                    newStart.setDate(effectiveStart.getDate() + realStartDay);
                    const newEnd = new Date(effectiveStart);
                    newEnd.setDate(effectiveStart.getDate() + realEndDay);
                    const { left, width } = getBarPosition(
                      newStart,
                      newEnd,
                      effectiveStart,
                      endOfWeek
                    );
                    return (
                      <PreviewBar
                        top="8px"
                        left={left}
                        width={width}
                        title="New Task Preview"
                      >
                        New Task
                      </PreviewBar>
                    );
                  })()}
              </ScheduleRow>
            </React.Fragment>
          );
        })}
      </Box>
    </Container>
  );
};
