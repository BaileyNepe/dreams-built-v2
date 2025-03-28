import { type DateTime } from 'luxon';
import { useState, type FC } from 'react';
import styled from 'styled-components';
import { getContrastingColor } from 'utils/color';
import { getWeeklyDatePercentage } from 'utils/date';
import { EditScheduleModal } from './components/ScheduleModal';
import { TaskBar } from './components/styles';
import { type Task } from './components/useSchedule';

const getBarPosition = (barStart: DateTime, barEnd: DateTime) => {
  const leftPct = getWeeklyDatePercentage(barStart);
  const rightPct = getWeeklyDatePercentage(barEnd.endOf('day'));
  return { left: `${leftPct}%`, width: `${Math.max(0, rightPct - leftPct)}%` };
};

const Notes = styled.span`
  display: block;
  font-size: 0.6rem;
  font-style: italic;
  margin-top: 0.1rem;
`;

export const ScheduleTask: FC<{
  tasks: Task[];
  onTaskModalChange: (open: boolean) => void;
}> = ({ tasks, onTaskModalChange }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      {tasks.map((task) =>
        task.segments.map((seg, idx) => {
          const { left, width } = getBarPosition(seg.segmentStart, seg.segmentEnd);
          return (
            <TaskBar
              key={`${task.id}-${idx}`}
              $left={left}
              $width={width}
              $backgroundColor={task.project.color}
              $color={getContrastingColor(task.project.color)}
              $dynamicHeight={!!task.notes}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
                onTaskModalChange(true);
              }}
            >
              {task.project.jobNumber} - {task.project.address}
              {task.notes && <Notes>{task.notes}</Notes>}
            </TaskBar>
          );
        })
      )}
      {selectedTask && (
        <EditScheduleModal
          open={!!selectedTask}
          data={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            onTaskModalChange(false);
          }}
        />
      )}
    </>
  );
};
