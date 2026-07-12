import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatCut } from '@dreams-built/shared/src/jobsheet/engine/format';
import { sizesDescending } from '@dreams-built/shared/src/jobsheet/engine/packRun';
import { type Cut, type Wall } from '@dreams-built/shared/src/jobsheet/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { memo, useEffect, useRef, useState, type FC } from 'react';
import { styled } from 'styled-components';
import { SECTION_COLORS } from '../constants';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { focusNav, navId } from './nav';

const runAreas = (columns: number) =>
  Array.from({ length: columns }, (_, i) => `'. run${i} run${i}'`).join(' ');

const Row = styled.div<{ $columns: number }>`
  align-items: center;
  background: ${(p) => p.theme.palette.background.paper};
  border-bottom: 1px solid ${(p) => p.theme.palette.divider};
  display: grid;
  gap: 0.5rem;
  grid-template-areas: 'drag num len ${(p) =>
    Array.from({ length: p.$columns }, (_, i) => `run${i}`).join(' ')} del';
  grid-template-columns: 2rem 2rem 7.5rem repeat(${(p) => p.$columns}, 1fr) 2.5rem;
  padding: 0.25rem 0.5rem;

  /* Small screens: one manual run per line, tagged with its section. */
  ${(p) => p.theme.breakpoints.down('md')} {
    grid-template-areas: 'drag num len del' ${(p) => runAreas(p.$columns)};
    grid-template-columns: 2rem 1.5rem 1fr auto;
    row-gap: 0.4rem;
  }
`;

const SectionTag = styled.span<{ $color: string }>`
  background: ${(p) => p.$color};
  border-radius: 4px;
  color: #000;
  display: none;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.6;
  padding: 0 0.4rem;
  white-space: nowrap;

  ${(p) => p.theme.breakpoints.down('md')} {
    display: inline-block;
  }
`;

const highlightFor = (column: number) =>
  column === 0
    ? SECTION_COLORS.shutters.highlight
    : column === 1
      ? SECTION_COLORS.rebate.highlight
      : undefined;

/** One manual column: deletable piece chips plus a "+" palette. */
const ManualRunCell: FC<{ wall: Wall; column: number }> = ({ wall, column }) => {
  const { dispatch, canEdit, rules } = useJobSheetContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [shortDraft, setShortDraft] = useState<{ mm: string; poly: boolean } | null>(
    null
  );

  const cuts = wall.manualRuns[column] ?? [];
  const setCuts = (next: Cut[]) => {
    const manualRuns = [...wall.manualRuns];
    while (manualRuns.length <= column) manualRuns.push([]);
    manualRuns[column] = next;
    dispatch({ type: 'updateWall', id: wall.id, patch: { manualRuns } });
  };
  const addCut = (cut: Cut) => setCuts([...cuts, cut]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
      {cuts.map((cut, index) => (
        <Chip
          // Positional: pieces have no identity.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          label={formatCut(cut)}
          size="small"
          sx={
            cut.kind === 'short'
              ? { backgroundColor: highlightFor(column), fontWeight: 700 }
              : cut.kind === 'blk'
                ? { border: '1px dashed', backgroundColor: 'transparent' }
                : {}
          }
          onDelete={
            canEdit ? () => setCuts(cuts.filter((_, i) => i !== index)) : undefined
          }
        />
      ))}

      {canEdit && (
        <IconButton
          size="small"
          aria-label="Add piece"
          onClick={(event) => setMenuAnchor(event.currentTarget)}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => {
          setMenuAnchor(null);
          setShortDraft(null);
        }}
      >
        {shortDraft === null ? (
          [
            ...sizesDescending(rules).map((size) => (
              <MenuItem
                key={size}
                dense
                onClick={() =>
                  addCut({ kind: 'standard', lengthMm: size, polystyrene: false })
                }
              >
                {size}
              </MenuItem>
            )),
            <Divider key="divider" />,
            <MenuItem
              key="blk"
              dense
              onClick={() =>
                addCut({ kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false })
              }
            >
              BLK
            </MenuItem>,
            <MenuItem key="short" dense onClick={() => setShortDraft({ mm: '', poly: false })}>
              Short…
            </MenuItem>
          ]
        ) : (
          <Box sx={{ px: 2, py: 1, display: 'grid', gap: 1, width: '11rem' }}>
            <TextField
              size="small"
              type="number"
              label="Short mm"
              inputRef={(node: HTMLInputElement | null) => node?.focus()}
              value={shortDraft.mm}
              onChange={(event) => setShortDraft({ ...shortDraft, mm: event.target.value })}
              onKeyDown={(event) => event.stopPropagation()}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={shortDraft.poly}
                  onChange={(event) =>
                    setShortDraft({ ...shortDraft, poly: event.target.checked })
                  }
                />
              }
              label="Polystyrene (p)"
            />
            <Button
              size="small"
              variant="contained"
              disabled={!(Number(shortDraft.mm) > 0)}
              onClick={() => {
                addCut({
                  kind: 'short',
                  lengthMm: Math.floor(Number(shortDraft.mm)),
                  polystyrene: shortDraft.poly
                });
                setShortDraft(null);
                setMenuAnchor(null);
              }}
            >
              Add short
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

/** Manual-mode row: measurement + hand-placed pieces per column. */
export const ManualWallRow: FC<{
  wall: Wall;
  number: number;
  columns: number;
  isNewlyAdded?: boolean;
  isLastRow?: boolean;
  onAddWall?: () => void;
}> = memo(({ wall, number, columns, isNewlyAdded = false, isLastRow = false, onAddWall }) => {
  const { dispatch, canEdit, rules, data } = useJobSheetContext();
  const sectionTags = [
    { label: rules.shutterLabel, color: SECTION_COLORS.shutters.header },
    { label: rules.rebateLabel, color: SECTION_COLORS.rebate.header },
    { label: data.thirdColumnLabel, color: '#e0e0e0' }
  ];
  const row = number - 1;
  const onMeasurementKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      if (focusNav(row + 1, 0)) event.preventDefault();
      else if (isLastRow && canEdit && onAddWall) {
        event.preventDefault();
        onAddWall();
      }
    } else if (event.key === 'Tab' && event.shiftKey) {
      if (focusNav(row - 1, 0)) event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (focusNav(row + 1, 0)) event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      if (focusNav(row - 1, 0)) event.preventDefault();
    }
  };

  const lengthInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isNewlyAdded) lengthInputRef.current?.focus();
  }, [isNewlyAdded]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: wall.id, disabled: !canEdit });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <Row $columns={columns}>
        <IconButton
          size="small"
          aria-label={`Reorder wall ${number}`}
          sx={{ cursor: 'grab', touchAction: 'none', gridArea: 'drag' }}
          disabled={!canEdit}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="body2"
          fontWeight={700}
          textAlign="center"
          sx={{ gridArea: 'num' }}
        >
          {number}
        </Typography>

        <TextField
          size="small"
          placeholder="mm"
          sx={{ gridArea: 'len' }}
          value={wall.lengthMm === 0 ? '' : wall.lengthMm}
          disabled={!canEdit}
          inputRef={lengthInputRef}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            'aria-label': `Wall ${number} measurement`,
            'data-nav': navId(row, 0),
            onKeyDown: onMeasurementKeyDown
          }}
          onChange={(event) => {
            const value = Math.max(
              0,
              Math.floor(Number(event.target.value.replace(/[^0-9]/g, '')) || 0)
            );
            dispatch({ type: 'updateWall', id: wall.id, patch: { lengthMm: value } });
          }}
        />

        {Array.from({ length: columns }, (_, column) => (
          <Box
            // Fixed column positions.
            // eslint-disable-next-line react/no-array-index-key
            key={column}
            sx={{
              gridArea: `run${column}`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75
            }}
          >
            <SectionTag $color={sectionTags[column]?.color ?? '#e0e0e0'}>
              {sectionTags[column]?.label}
            </SectionTag>
            <Box sx={{ flex: 1 }}>
              <ManualRunCell wall={wall} column={column} />
            </Box>
          </Box>
        ))}

        <IconButton
          size="small"
          aria-label={`Remove wall ${number}`}
          sx={{ gridArea: 'del' }}
          disabled={!canEdit}
          onClick={() => dispatch({ type: 'removeWall', id: wall.id })}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Row>
    </div>
  );
});

ManualWallRow.displayName = 'ManualWallRow';
