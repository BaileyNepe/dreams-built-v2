import { Tooltip } from '@mui/material';
import { type DateTime } from 'luxon';
import { useState, type FC } from 'react';
import { getContrastingColor } from 'utils/color';
import { getWeeklyDatePercentage } from 'utils/date';
import { EditScheduleModal } from './ScheduleModal';
import { TaskBar } from './styles';
import { type Task } from './useSchedule';

const getBarPosition = (barStart: DateTime, barEnd: DateTime) => {
  const leftPct = getWeeklyDatePercentage(barStart);
  const rightPct = getWeeklyDatePercentage(barEnd);
  return { left: `${leftPct}%`, width: `${Math.max(0, rightPct - leftPct)}%` };
};

export const ScheduleRow: FC<{
  tasks: Task[];
  onTaskModalChange: (open: boolean) => void;
}> = ({ tasks, onTaskModalChange }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      {tasks.map((task) =>
        task.segments.map((seg, idx) => {
          const { left, width } = getBarPosition(seg.segmentStart, seg.segmentEnd);
          const top = `${8 + task.lane * 30}px`;
          return (
            <Tooltip
              key={`${task.id}-${idx}`}
              title={`${task.project.jobNumber} - ${task.project.address} (${task.project.client.name})${task.notes ? `. Notes: ${task.notes}` : ''}`.trim()}
            >
              <TaskBar
                $top={top}
                $left={left}
                $width={width}
                $backgroundColor={task.project.color}
                $color={getContrastingColor(task.project.color)}
                title={task.project.address}
                onMouseDown={(e) => e.stopPropagation()} // Prevent propagation on mousedown
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task);
                  onTaskModalChange(true); // notify parent that a task modal is open
                }}
              >
                {task.project.jobNumber} - {task.project.address}
              </TaskBar>
            </Tooltip>
          );
        })
      )}
      {selectedTask && (
        <EditScheduleModal
          open={!!selectedTask}
          data={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            onTaskModalChange(false); // notify parent that the task modal is closed
          }}
        />
      )}
    </>
  );
};
