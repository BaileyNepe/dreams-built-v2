import { type DateTime } from 'luxon';
import { useState, type FC } from 'react';
import styled from 'styled-components';
import { getContrastingColor } from 'utils/color';
import { EditScheduleModal } from './components/ScheduleModal';
import { TaskBar } from './components/styles';
import { useScheduler, type Task } from './components/useSchedule';

const Notes = styled.span`
  display: block;
  font-size: 0.6rem;
  font-style: italic;
  margin-top: 0.01rem;
`;

export const ScheduleTask: FC<{
  tasks: Task[];
  onTaskModalChange: (open: boolean) => void;
}> = ({ tasks, onTaskModalChange }) => {
  const { hasPermissionToEdit, datesToShow } = useScheduler();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getGridPosition = (barStart: DateTime, barEnd: DateTime) => {
    const startColumn =
      datesToShow.findIndex((date) => date.startOf('day') >= barStart.startOf('day')) + 1;

    const endColumn =
      datesToShow.findLastIndex((date) => date.startOf('day') <= barEnd.startOf('day')) +
      2; // end is exclusive

    return { gridColumnStart: startColumn, gridColumnEnd: endColumn };
  };

  return (
    <>
      {tasks.map((task) =>
        task.segments.map((seg, idx) => {
          const { gridColumnStart, gridColumnEnd } = getGridPosition(
            seg.segmentStart,
            seg.segmentEnd
          );

          return (
            <TaskBar
              key={`${task.id}-${idx}`}
              $backgroundColor={task.project.color}
              $color={getContrastingColor(task.project.color)}
              style={{ gridColumnStart, gridColumnEnd }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (!hasPermissionToEdit) return;
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
