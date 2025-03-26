import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { getWeeklyDatePercentage, isMatchingDates } from 'utils/date';
import { type LaneTask } from './types';

const blockedDays: string[] = ['2025-03-13', '2025-03-15'];

const getBarPosition = (barStart: DateTime, barEnd: DateTime) => {
  const leftPct = getWeeklyDatePercentage(barStart);
  const rightPct = getWeeklyDatePercentage(barEnd);
  const widthPct = Math.max(0, rightPct - leftPct);
  return { left: `${leftPct}%`, width: `${widthPct}%` };
};

const computeTaskSegments = (
  task: LaneTask,
  startOfWeek: DateTime,
  endOfWeek: DateTime
) => {
  const segments: { segmentStart: DateTime; segmentEnd: DateTime }[] = [];
  const effectiveStart = task.start > startOfWeek ? task.start : startOfWeek;
  const effectiveEnd = task.end < endOfWeek ? task.end : endOfWeek;

  let currentSegmentStart: DateTime | null = null;

  let iterDate = effectiveStart.startOf('day');
  while (iterDate <= effectiveEnd) {
    if (!isMatchingDates(iterDate, blockedDays)) {
      if (!currentSegmentStart) {
        currentSegmentStart = iterDate;
      }
    } else if (currentSegmentStart) {
      // End current segment at the end of the previous day
      segments.push({
        segmentStart: currentSegmentStart,
        segmentEnd: iterDate.minus({ days: 1 }).endOf('day')
      });
      currentSegmentStart = null;
    }
    iterDate = iterDate.plus({ days: 1 }).startOf('day');
  }
  if (currentSegmentStart) {
    segments.push({ segmentStart: currentSegmentStart, segmentEnd: effectiveEnd });
  }
  return segments;
};

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

export const ScheduleRow: FC<{
  tasks: LaneTask[];
  startOfWeek: DateTime;
  endOfWeek: DateTime;
}> = ({ tasks, startOfWeek, endOfWeek }) =>
  tasks.map((t) => {
    const segments = computeTaskSegments(t, startOfWeek, endOfWeek);
    return segments.map((seg, idx) => {
      const { left, width } = getBarPosition(seg.segmentStart, seg.segmentEnd);
      const top = 8 + t.lane * 30;
      return (
        <TaskBar
          key={`${t.id}-${idx}`}
          top={`${top}px`}
          left={left}
          width={width}
          backgroundColor={t.color}
          title={t.name}
        >
          {t.name}
        </TaskBar>
      );
    });
  });
