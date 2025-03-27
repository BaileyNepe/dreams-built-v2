import { type DateTime } from 'luxon';
import { useState, type FC } from 'react';
import { getContrastingColor } from 'utils/color';
import { getWeeklyDatePercentage } from 'utils/date';
import { EditScheduleModal } from './ScheduleModal';
import { TaskBar } from './styles';
import { type ScheduleContextType } from './useSchedule';

const getBarPosition = (barStart: DateTime, barEnd: DateTime) => {
  const leftPct = getWeeklyDatePercentage(barStart);
  const rightPct = getWeeklyDatePercentage(barEnd);
  return { left: `${leftPct}%`, width: `${Math.max(0, rightPct - leftPct)}%` };
};

export const ScheduleRow: FC<{
  tasks: ScheduleContextType['jobPartsWithSegments'][0]['tasks'];
  onTaskModalChange: (open: boolean) => void;
}> = ({ tasks, onTaskModalChange }) => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
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
              onMouseDown={(e) => e.stopPropagation()} // Prevent propagation on mousedown
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
                setIsTaskModalOpen(true);
                onTaskModalChange(true); // notify parent that a task modal is open
              }}
            >
              {task.project.address}
            </TaskBar>
          );
        })
      )}
      {isTaskModalOpen && selectedTask && (
        <EditScheduleModal
          open={isTaskModalOpen}
          data={selectedTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            onTaskModalChange(false); // notify parent that the task modal is closed
          }}
        />
      )}
    </>
  );
};
