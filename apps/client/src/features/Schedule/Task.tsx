import { type DateTime } from 'luxon';
import { useState, type FC } from 'react';
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
              {task.notes && <div style={{ marginTop: '0.25rem' }}>{task.notes}</div>}
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
