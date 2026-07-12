import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { BlockDaysOverlay } from './components/BlockDaysOverlay';
import { taskBarHeight, taskBarSpacing } from './components/constants';
import { RangeSelectionModal } from './components/ScheduleModal';
import { TaskBar } from './components/styles';
import { type ProjectPart, useScheduler } from './components/useSchedule';
import { ScheduleTask } from './Task';

const LaneContainer = styled(Box)<{ columns: number }>`
  display: grid;
  gap: 0.2rem;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  margin-bottom: ${taskBarSpacing};
  min-height: ${taskBarHeight};
  position: relative;
`;

const DragSkeletonBar = styled(TaskBar)`
  border: 1px dashed ${({ theme }) => theme.palette.primary.main};
  bottom: ${taskBarSpacing};
  height: ${taskBarHeight};
  opacity: 0.5;
  pointer-events: none;
  position: absolute;
`;

const ScheduleRowContainer = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  cursor: pointer;
  padding: ${taskBarSpacing} 0 calc(${taskBarHeight} + ${taskBarSpacing});
  position: relative;
  /* Horizontal drags select a range; vertical touch drags still scroll. */
  touch-action: pan-y;
  user-select: none;

  @media print {
    padding-bottom: 0;
  }
`;

const PrintableGridOverlay = styled.div<{ $cells: number }>`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  @media print {
    /* Draw a vertical line (1px) on the right of each cell */
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    /* The grid repeats every cell width */
    background-size: ${(props) => 100 / props.$cells}% 100%;
  }
`;

/* Helper: convert a percentage (0-100) to a DateTime between start and end */
const getDateFromPercentage = (percentage: number, start: DateTime, end: DateTime) => {
  const diffMillis = end.toMillis() - start.toMillis();
  const selectedMillis = diffMillis * (percentage / 100);
  return start.plus({ milliseconds: selectedMillis });
};

export const InteractiveScheduleRow = ({
  projectParts
}: {
  projectParts: ProjectPart;
}) => {
  const { startOfWeek, endOfWeek, datesToShow, hasPermissionToEdit } = useScheduler();
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<{ start: DateTime; end: DateTime } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const modalOpen = range !== null || isTaskModalOpen;

  // Pointer events (not mouse events) so range selection works with touch
  // and pen too. Capturing the pointer keeps the drag alive when the finger
  // wanders off the row — no more selections lost at the row edge.
  const rowX = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modalOpen || !e.isPrimary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const x = rowX(e);
    setDragStart(x);
    setDragEnd(x);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modalOpen || dragStart === null) return;
    setDragEnd(rowX(e));
  };

  // The browser took the gesture over (e.g. the page scrolled): abandon.
  const handlePointerCancel = () => {
    setDragStart(null);
    setDragEnd(null);
  };

  const handlePointerUp = () => {
    if (modalOpen) return;
    if (dragStart !== null && dragEnd !== null && containerRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const startPct = (Math.min(dragStart, dragEnd) / containerWidth) * 100;
      const endPct = (Math.max(dragStart, dragEnd) / containerWidth) * 100;
      const computedRangeStart = getDateFromPercentage(startPct, startOfWeek, endOfWeek);
      const computedRangeEnd = getDateFromPercentage(endPct, startOfWeek, endOfWeek);
      setRange({ start: computedRangeStart, end: computedRangeEnd });
    }
    setDragStart(null);
    setDragEnd(null);
  };

  let skeleton = null;

  if (dragStart !== null && dragEnd !== null && containerRef.current) {
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const startPct = (Math.min(dragStart, dragEnd) / containerWidth) * 100;
    const endPct = (Math.max(dragStart, dragEnd) / containerWidth) * 100;
    const rangeStart = getDateFromPercentage(startPct, startOfWeek, endOfWeek);
    const rangeEnd = getDateFromPercentage(endPct, startOfWeek, endOfWeek);

    const firstIndex = datesToShow.findIndex(
      (date) => date.startOf('day') >= rangeStart.startOf('day')
    );

    const lastIndex = datesToShow.findLastIndex(
      (date) => date.startOf('day') <= rangeEnd.startOf('day')
    );

    if (firstIndex !== -1 && lastIndex !== -1) {
      const cellWidthPercent = 100 / datesToShow.length;
      const leftPct = `${firstIndex * cellWidthPercent}%`;
      const widthPct = `${(lastIndex - firstIndex + 1) * cellWidthPercent}%`;

      skeleton = (
        <DragSkeletonBar
          style={{
            left: leftPct,
            width: widthPct
          }}
        />
      );
    }
  }

  const tasksByLaneObj = projectParts.tasks.reduce(
    (acc, task) => {
      (acc[task.lane] = acc[task.lane] || []).push(task);
      return acc;
    },
    {} as Record<number, typeof projectParts.tasks>
  );

  const laneNumbers = Object.keys(tasksByLaneObj).map(Number);

  return (
    <ScheduleRowContainer
      ref={containerRef}
      onPointerDown={hasPermissionToEdit ? handlePointerDown : undefined}
      onPointerMove={hasPermissionToEdit ? handlePointerMove : undefined}
      onPointerUp={hasPermissionToEdit ? handlePointerUp : undefined}
      onPointerCancel={hasPermissionToEdit ? handlePointerCancel : undefined}
    >
      {skeleton}
      <BlockDaysOverlay />
      <PrintableGridOverlay $cells={datesToShow.length} />
      {laneNumbers.map((lane) => (
        <LaneContainer key={lane} columns={datesToShow.length}>
          <ScheduleTask
            tasks={tasksByLaneObj[lane]}
            onTaskModalChange={setIsTaskModalOpen}
          />
        </LaneContainer>
      ))}
      <RangeSelectionModal
        range={range}
        onClose={() => setRange(null)}
        projectPartId={projectParts.id}
      />
    </ScheduleRowContainer>
  );
};
