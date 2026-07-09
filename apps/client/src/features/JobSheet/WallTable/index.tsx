import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import AddIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { useState, type FC } from 'react';
import { styled } from 'styled-components';
import { SECTION_COLORS } from '../constants';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { ManualWallRow } from './ManualWallRow';
import { WallRow } from './WallRow';

const HeaderRow = styled.div`
  align-items: stretch;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 2rem 2rem 7.5rem 8.5rem 8.5rem 1fr 1fr 4.5rem;
  padding: 0 0.5rem;
`;

const SectionHeader = styled(Typography)<{ $color: string }>`
  && {
    background: ${(p) => p.$color};
    border-radius: 4px;
    color: #000;
    font-weight: 700;
    padding: 0.35rem;
    text-align: center;
  }
`;

const ManualHeaderRow = styled.div<{ $columns: number }>`
  align-items: end;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 2rem 2rem 7.5rem repeat(${(p) => p.$columns}, 1fr) 2.5rem;
  padding: 0 0.5rem;
`;

const ColumnLabel = styled(Typography)`
  && {
    align-self: end;
    color: ${(p) => p.theme.palette.text.secondary};
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

/**
 * The editable wall list. One row per wall — the paper sheet's two
 * numbered columns are the two breakdown cells of the same wall. Rows
 * drag-reorder (pointer or keyboard: focus the handle, Space to lift,
 * arrows to move, Space to drop); order defines the wall numbers.
 */
export const WallTable: FC = () => {
  const { data, computed, dispatch, canEdit, rules } = useJobSheetContext();
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = data.walls.findIndex((wall) => wall.id === active.id);
    const to = data.walls.findIndex((wall) => wall.id === over.id);
    dispatch({ type: 'moveWall', from, to });
  };

  const addWall = () => {
    const id = crypto.randomUUID();
    setLastAddedId(id);
    dispatch({ type: 'addWall', id });
  };

  const isManual = data.mode === 'manual';
  const manualColumns = data.manualThirdColumn ? 3 : 2;

  return (
    <div>
      {isManual ? (
        <ManualHeaderRow $columns={manualColumns}>
          <span />
          <ColumnLabel>#</ColumnLabel>
          <ColumnLabel>Measurement</ColumnLabel>
          <SectionHeader $color={SECTION_COLORS.shutters.header}>
            {rules.shutterLabel}
          </SectionHeader>
          <SectionHeader $color={SECTION_COLORS.rebate.header}>
            {rules.rebateLabel}
          </SectionHeader>
          {manualColumns === 3 && (
            <SectionHeader $color="#e0e0e0">{data.thirdColumnLabel}</SectionHeader>
          )}
          <span />
        </ManualHeaderRow>
      ) : (
        <>
          <HeaderRow>
            <span />
            <span />
            <span />
            <span />
            <span />
            <SectionHeader $color={SECTION_COLORS.shutters.header}>
              {rules.shutterLabel}
            </SectionHeader>
            <SectionHeader $color={SECTION_COLORS.rebate.header}>
              {rules.rebateLabel}
            </SectionHeader>
            <span />
          </HeaderRow>
          <HeaderRow>
            <span />
            <ColumnLabel>#</ColumnLabel>
            <ColumnLabel>Measurement</ColumnLabel>
            <ColumnLabel>Start corner</ColumnLabel>
            <ColumnLabel>End corner</ColumnLabel>
            <span />
            <span />
            <span />
          </HeaderRow>
        </>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={data.walls.map((wall) => wall.id)}
          strategy={verticalListSortingStrategy}
        >
          {data.walls.map((wall, index) =>
            isManual ? (
              <ManualWallRow
                key={wall.id}
                wall={wall}
                number={index + 1}
                columns={manualColumns}
                isNewlyAdded={wall.id === lastAddedId}
                isLastRow={index === data.walls.length - 1}
                onAddWall={addWall}
              />
            ) : (
              <WallRow
                key={wall.id}
                wall={wall}
                computed={computed.walls[index]}
                isNewlyAdded={wall.id === lastAddedId}
                onAddWall={addWall}
              />
            )
          )}
        </SortableContext>
      </DndContext>

      {data.walls.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No walls yet. Wall 1 is the garage-door wall; add walls clockwise around
          the foundation.
        </Typography>
      )}

      {canEdit && (
        <Button startIcon={<AddIcon />} onClick={addWall} sx={{ m: 1 }}>
          Add wall
        </Button>
      )}
    </div>
  );
};
