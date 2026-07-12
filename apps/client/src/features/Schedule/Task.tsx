import { useUpdateScheduleMutation } from 'api/schedule';
import { type DateTime } from 'luxon';
import { useRef, useState, type FC } from 'react';
import styled from 'styled-components';
import { getContrastingColor } from 'utils/color';
import { formatDate } from 'utils/date';
import { EditScheduleModal } from './components/ScheduleModal';
import { TaskBar } from './components/styles';
import { useScheduler, type Task } from './components/useSchedule';

const Notes = styled.span`
  display: block;
  font-size: 0.6rem;
  font-style: italic;
  margin-top: 0.01rem;
`;

/** Invisible grip zone on a bar edge; drag it to change that date. */
const ResizeHandle = styled.span<{ $edge: 'start' | 'end' }>`
  border-radius: inherit;
  bottom: 0;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  width: 10px;
  ${({ $edge }) => ($edge === 'start' ? 'left: -2px;' : 'right: -2px;')}

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }

  @media print {
    display: none;
  }
`;

type DragMode = 'move' | 'resize-start' | 'resize-end';

type BarDragRender = {
  taskId: string;
  mode: DragMode;
  dayDelta: number;
  hasMoved: boolean;
};

/**
 * Task bars support three pointer gestures (mouse, touch or pen):
 * tap opens the editor; dragging the body moves the whole task by days;
 * dragging an end grip changes just that date. The bar previews the
 * day-snapped result live and the change is saved on release.
 */
export const ScheduleTask: FC<{
  tasks: Task[];
  onTaskModalChange: (open: boolean) => void;
}> = ({ tasks, onTaskModalChange }) => {
  const { hasPermissionToEdit, datesToShow } = useScheduler();
  const update = useUpdateScheduleMutation();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [barDrag, setBarDrag] = useState<BarDragRender | null>(null);
  const dragRef = useRef<{
    task: Task;
    mode: DragMode;
    originX: number;
    cellWidth: number;
    dayDelta: number;
    hasMoved: boolean;
  } | null>(null);

  const getGridPosition = (barStart: DateTime, barEnd: DateTime) => {
    const startColumn =
      datesToShow.findIndex((date) => date.startOf('day') >= barStart.startOf('day')) + 1;

    const endColumn =
      datesToShow.findLastIndex((date) => date.startOf('day') <= barEnd.startOf('day')) +
      2; // end is exclusive

    return { gridColumnStart: startColumn, gridColumnEnd: endColumn };
  };

  const openEditor = (task: Task) => {
    setSelectedTask(task);
    onTaskModalChange(true);
  };

  const handleBarPointerDown = (task: Task) => (e: React.PointerEvent<HTMLElement>) => {
    // Never let a bar press start the row's create-range selection.
    e.stopPropagation();
    if (!hasPermissionToEdit || !e.isPrimary) return;
    const grip = (e.target as HTMLElement).dataset.resize;
    const mode: DragMode =
      grip === 'start' ? 'resize-start' : grip === 'end' ? 'resize-end' : 'move';
    const lane = e.currentTarget.parentElement;
    if (!lane) return;
    const cellWidth = lane.getBoundingClientRect().width / datesToShow.length;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      task,
      mode,
      originX: e.clientX,
      cellWidth,
      dayDelta: 0,
      hasMoved: false
    };
    setBarDrag({ taskId: task.id, mode, dayDelta: 0, hasMoved: false });
  };

  const handleBarPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.originX;
    if (Math.abs(dx) > 5) drag.hasMoved = true;
    drag.dayDelta = Math.round(dx / drag.cellWidth);
    setBarDrag(
      (prev) =>
        prev && { ...prev, dayDelta: drag.dayDelta, hasMoved: drag.hasMoved }
    );
  };

  const handleBarPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setBarDrag(null);
    if (!drag) return;

    // No real movement: it was a tap — open the editor.
    if (!drag.hasMoved) {
      openEditor(drag.task);
      return;
    }
    if (drag.dayDelta === 0) return;

    const { task, mode, dayDelta } = drag;
    let newStart = task.start;
    let newEnd = task.end;
    if (mode === 'move') {
      newStart = task.start.plus({ days: dayDelta });
      newEnd = task.end.plus({ days: dayDelta });
    } else if (mode === 'resize-start') {
      const candidate = task.start.plus({ days: dayDelta });
      newStart = candidate > task.end ? task.end : candidate;
    } else {
      const candidate = task.end.plus({ days: dayDelta });
      newEnd = candidate < task.start ? task.start : candidate;
    }

    update.mutate({
      id: task.id,
      startDate: formatDate({ date: newStart }),
      endDate: formatDate({ date: newEnd }),
      color: task.project.color,
      notes: task.notes ?? '',
      deleted: false
    });
  };

  const handleBarPointerCancel = () => {
    dragRef.current = null;
    setBarDrag(null);
  };

  const columns = datesToShow.length;

  return (
    <>
      {tasks.map((task) =>
        task.segments.map((seg, idx) => {
          const position = getGridPosition(seg.segmentStart, seg.segmentEnd);
          let { gridColumnStart, gridColumnEnd } = position;

          // Live day-snapped preview while this task is being dragged.
          const isDragging = barDrag?.taskId === task.id && barDrag.hasMoved;
          if (isDragging && barDrag) {
            const width = position.gridColumnEnd - position.gridColumnStart;
            if (barDrag.mode === 'move') {
              gridColumnStart = Math.max(
                1,
                Math.min(columns + 1 - width, position.gridColumnStart + barDrag.dayDelta)
              );
              gridColumnEnd = gridColumnStart + width;
            } else if (barDrag.mode === 'resize-end' && idx === task.segments.length - 1) {
              gridColumnEnd = Math.max(
                position.gridColumnStart + 1,
                Math.min(columns + 1, position.gridColumnEnd + barDrag.dayDelta)
              );
            } else if (barDrag.mode === 'resize-start' && idx === 0) {
              gridColumnStart = Math.max(
                1,
                Math.min(position.gridColumnEnd - 1, position.gridColumnStart + barDrag.dayDelta)
              );
            }
          }

          const isFirstSegment = idx === 0;
          const isLastSegment = idx === task.segments.length - 1;

          return (
            <TaskBar
              key={`${task.id}-${idx}`}
              $backgroundColor={task.project.color}
              $color={getContrastingColor(task.project.color)}
              style={{
                gridColumnStart,
                gridColumnEnd,
                cursor: hasPermissionToEdit
                  ? isDragging
                    ? 'grabbing'
                    : 'grab'
                  : undefined,
                ...(isDragging && {
                  opacity: 0.8,
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35)'
                })
              }}
              onPointerDown={handleBarPointerDown(task)}
              onPointerMove={handleBarPointerMove}
              onPointerUp={handleBarPointerUp}
              onPointerCancel={handleBarPointerCancel}
            >
              {task.project.jobNumber} - {task.project.address}
              {task.notes && <Notes>{task.notes}</Notes>}
              {hasPermissionToEdit && isFirstSegment && (
                <ResizeHandle data-resize="start" $edge="start" />
              )}
              {hasPermissionToEdit && isLastSegment && (
                <ResizeHandle data-resize="end" $edge="end" />
              )}
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
