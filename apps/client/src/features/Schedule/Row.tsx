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

const ScheduleRowContainer = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  cursor: pointer;
  padding-bottom: calc(${taskBarHeight} + ${taskBarSpacing});
  padding-top: ${taskBarSpacing};
  position: relative;
  user-select: none;
`;

const LaneContainer = styled(Box)`
  margin-bottom: ${taskBarSpacing};
  min-height: 1.7rem;
  position: relative;
`;

/* A helper to position the drag skeleton overlay at the bottom */
const DragSkeletonBar = styled(TaskBar)`
  bottom: ${taskBarSpacing};
  height: ${taskBarHeight};
  position: absolute;
  top: auto;
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
  const { startOfWeek, endOfWeek, datesToShow } = useScheduler();
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [range, setRange] = useState<{ start: DateTime; end: DateTime } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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

  // Render the skeleton overlay for drag–to–create new task.
  // It is aligned with the schedule columns and positioned at the bottom.
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
      skeleton = <DragSkeletonBar $left={leftPct} $width={widthPct} />;
    }
  }

  // Group tasks by lane based on their original lane value
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {skeleton}
      <BlockDaysOverlay />
      {laneNumbers.map((lane) => (
        <LaneContainer key={lane}>
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
