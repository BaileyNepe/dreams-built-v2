import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { BlockDaysOverlay } from './BlockDaysOverlay';
import { RangeSelectionModal } from './ScheduleModal';
import { ScheduleRow } from './ScheduleRow';
import { TaskBar } from './styles';
import { useScheduler } from './useSchedule';

const NEW_TASK_HEIGHT = 30; // Vertical offset for the new task row

/* Container for each schedule row */
const ScheduleRowContainer = styled(Box)<{ $minHeight: string }>`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  cursor: pointer;
  min-height: ${({ $minHeight }) => $minHeight};
  position: relative;
  user-select: none;
`;

/* Helper: convert a percentage (0-100) to a DateTime between start and end */
const getDateFromPercentage = (percentage: number, start: DateTime, end: DateTime) => {
  const diffMillis = end.toMillis() - start.toMillis();
  const selectedMillis = diffMillis * (percentage / 100);
  return start.plus({ milliseconds: selectedMillis });
};

export const InteractiveScheduleRow = ({
  jp,
  rowHeight
}: {
  jp: ReturnType<typeof useScheduler>['jobPartsWithSegments'][number];
  rowHeight: number;
}) => {
  const { startOfWeek, endOfWeek, datesToShow } = useScheduler();
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for range selection modal in this container
  const [range, setRange] = useState<{ start: DateTime; end: DateTime } | null>(null);
  // Lift up task modal open state from the child ScheduleRow
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Determine if any modal is open
  const modalOpen = range !== null || isTaskModalOpen;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragStart(x);
    setDragEnd(x);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalOpen || dragStart === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragEnd(x);
  };

  const handleMouseLeave = () => {
    if (modalOpen) return;
    setDragStart(null);
    setDragEnd(null);
  };

  const handleMouseUp = () => {
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

  // (Optional) render a skeleton for visual feedback while dragging.
  let skeleton = null;
  if (dragStart !== null && dragEnd !== null && containerRef.current) {
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const startPct = (Math.min(dragStart, dragEnd) / containerWidth) * 100;
    const endPct = (Math.max(dragStart, dragEnd) / containerWidth) * 100;
    const rangeStart = getDateFromPercentage(startPct, startOfWeek, endOfWeek);
    const rangeEnd = getDateFromPercentage(endPct, startOfWeek, endOfWeek);
    const firstIndex = datesToShow.findIndex(
      (date) => date.startOf('day').toMillis() >= rangeStart.startOf('day').toMillis()
    );
    const lastIndexReversed = datesToShow
      .slice()
      .reverse()
      .findIndex(
        (date) => date.startOf('day').toMillis() <= rangeEnd.startOf('day').toMillis()
      );
    const adjustedLastIndex =
      lastIndexReversed === -1
        ? datesToShow.length - 1
        : datesToShow.length - 1 - lastIndexReversed;
    if (firstIndex !== -1 && adjustedLastIndex !== -1) {
      const cellWidthPercent = 100 / datesToShow.length;
      const leftPct = `${firstIndex * cellWidthPercent}%`;
      const widthPct = `${(adjustedLastIndex - firstIndex + 1) * cellWidthPercent}%`;
      skeleton = <TaskBar $top="8px" $left={leftPct} $width={widthPct} />;
    }
  }

  // Shift tasks downward to make room if dragging is active.
  const tasksWrapperStyle =
    dragStart !== null ? { transform: `translateY(${NEW_TASK_HEIGHT}px)` } : {};

  return (
    <ScheduleRowContainer
      ref={containerRef}
      $minHeight={`${rowHeight}px`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {skeleton}
      <BlockDaysOverlay />
      <div style={tasksWrapperStyle}>
        {/* Pass the callback to update the task modal open state */}
        <ScheduleRow tasks={jp.tasks} onTaskModalChange={setIsTaskModalOpen} />
      </div>
      <RangeSelectionModal range={range} onClose={() => setRange(null)} />
    </ScheduleRowContainer>
  );
};
