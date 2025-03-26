import { Box } from '@mui/material';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';
import { getContrastingColor } from 'utils/color';
import { getWeeklyDatePercentage } from 'utils/date';
import { type ScheduleContextType } from './useSchedule';

const TaskBar = styled(Box)<{
  $top: string;
  $left: string;
  $width: string;
  $backgroundColor: string;
  $color: string;
}>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: 1px solid #888;
  border-radius: 4px;
  color: ${({ $color }) => $color};
  font-size: 0.8rem;
  font-weight: bold;
  height: 24px;
  left: ${({ $left: left }) => left};
  overflow: hidden;
  padding: 2px;
  position: absolute;
  text-overflow: ellipsis;
  top: ${({ $top: top }) => top};
  white-space: nowrap;
  width: ${({ $width: width }) => width};
`;

const getBarPosition = (barStart: DateTime, barEnd: DateTime) => {
  const leftPct = getWeeklyDatePercentage(barStart);
  const rightPct = getWeeklyDatePercentage(barEnd);
  return { left: `${leftPct}%`, width: `${Math.max(0, rightPct - leftPct)}%` };
};

export const ScheduleRow: FC<{
  tasks: ScheduleContextType['jobPartsWithSegments'][0]['tasks'];
}> = ({ tasks }) => (
  <>
    {tasks.map((task) =>
      task.segments.map((seg, idx) => {
        const { left, width } = getBarPosition(seg.segmentStart, seg.segmentEnd);
        const top = `${8 + task.lane * 30}px`;
        return (
          <TaskBar
            key={`${task.id}-${idx}`}
            $top={top}
            $left={left}
            $width={width}
            $backgroundColor={task.project.color}
            $color={getContrastingColor(task.project.color)}
            title={task.project.address}
          >
            {task.project.address}
          </TaskBar>
        );
      })
    )}
  </>
);
