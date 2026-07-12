import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  formatCompoundLength,
  parseCompoundLength
} from '@dreams-built/shared/src/jobsheet/engine/compound';
import { resolveEnds } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import { neighboursOf } from '@dreams-built/shared/src/jobsheet/engine/loops';
import {
  type ComputedWall,
  type CornerKind,
  type Wall
} from '@dreams-built/shared/src/jobsheet/types';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { memo, useEffect, useRef, useState, type FC } from 'react';
import { styled } from 'styled-components';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { BreakdownCell } from './BreakdownCell';
import { focusNav, navId } from './nav';
import { OpeningsEditor } from './OpeningsEditor';
import { OverrideEditor } from './OverrideEditor';
import { RebateInsetsEditor } from './RebateInsetsEditor';

const Row = styled.div`
  align-items: center;
  background: ${(p) => p.theme.palette.background.paper};
  border-bottom: 1px solid ${(p) => p.theme.palette.divider};
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 2rem 2rem 7.5rem 6.5rem 6.5rem 1fr 1fr 4.5rem;
  padding: 0.25rem 0.5rem;
`;

const DetailPanel = styled.div`
  background: ${(p) => p.theme.palette.action.hover};
  border-bottom: 1px solid ${(p) => p.theme.palette.divider};
  display: grid;
  gap: 0.9rem;
  padding: 0.75rem 1rem 1rem 5.5rem;
`;

/**
 * Ext | Int segmented toggle. One tab stop per cell: the selected side
 * carries the data-nav id, so grid focus always lands on the current value.
 * Space/Enter flip the corner; arrows move between cells like a spreadsheet.
 */
const CornerToggle: FC<{
  label: string;
  value: CornerKind;
  disabled: boolean;
  onChange: (value: CornerKind) => void;
  row: number;
  col: number;
}> = ({ label, value, disabled, onChange, row, col }) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    color="primary"
    fullWidth
    value={value}
    disabled={disabled}
    aria-label={label}
    onChange={(event, next: CornerKind | null) => {
      // Keyboard flips are handled in onKeyDown; a browser-synthesised
      // click (detail 0) would flip the value a second time.
      if (next && event.detail > 0) onChange(next);
    }}
    onKeyDown={(event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onChange(value === 'external' ? 'internal' : 'external');
      } else if (event.key === 'ArrowLeft' && focusNav(row, col - 1)) {
        event.preventDefault();
      } else if (event.key === 'ArrowRight' && focusNav(row, col + 1)) {
        event.preventDefault();
      } else if (event.key === 'ArrowDown' && focusNav(row + 1, col)) {
        event.preventDefault();
      } else if (event.key === 'ArrowUp' && focusNav(row - 1, col)) {
        event.preventDefault();
      }
    }}
  >
    <ToggleButton
      value="external"
      sx={{ px: 0.5, textTransform: 'none' }}
      tabIndex={value === 'external' ? 0 : -1}
      data-nav={value === 'external' ? navId(row, col) : undefined}
    >
      Ext
    </ToggleButton>
    <ToggleButton
      value="internal"
      sx={{ px: 0.5, textTransform: 'none' }}
      tabIndex={value === 'internal' ? 0 : -1}
      data-nav={value === 'internal' ? navId(row, col) : undefined}
    >
      Int
    </ToggleButton>
  </ToggleButtonGroup>
);

export const WallRow: FC<{
  wall: Wall;
  computed: ComputedWall;
  isNewlyAdded?: boolean;
  onAddWall?: (foundationId?: string) => void;
}> = memo(({ wall, computed, isNewlyAdded = false, onAddWall }) => {
  const { dispatch, canEdit, rules, data } = useJobSheetContext();

  // Corner adjustments resolve automatically from the corner kinds; the
  // checkboxes show the resolved state and clicking forces an override.
  // Neighbours wrap within the wall's own foundation loop.
  const index = data.walls.findIndex((w) => w.id === wall.id);
  const ends = resolveEnds(wall, neighboursOf(data, wall.id) ?? {});
  const auto = (flag: boolean | null) => (flag === null ? ' (auto)' : '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Move focus into a freshly added row so measurements can be typed
  // one after another without reaching for the mouse.
  const lengthInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isNewlyAdded) lengthInputRef.current?.focus();
  }, [isNewlyAdded]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: wall.id, disabled: !canEdit });

  const patch = (fields: Partial<Wall>) =>
    dispatch({ type: 'updateWall', id: wall.id, patch: fields });

  const polystyreneValue =
    wall.polystyreneOverride === null ? 'auto' : String(wall.polystyreneOverride);

  // The measurement accepts compound notation — `4200/810b` = 4200 bare
  // then 810 of brick (b or r) — which sets the length AND the rebate
  // insets in one go. While the field is focused the raw text is kept;
  // on blur it reverts to the canonical form derived from state.
  const canonicalLength =
    wall.hasRebate && wall.rebateInsets.some((inset) => inset.widthMm > 0)
      ? formatCompoundLength(wall.lengthMm, wall.rebateInsets)
      : `${wall.lengthMm === 0 ? '' : wall.lengthMm}`;
  const [lengthDraft, setLengthDraft] = useState<string | null>(null);
  const onLengthChange = (raw: string) => {
    setLengthDraft(raw);
    if (raw.trim() === '') {
      patch({ lengthMm: 0, rebateInsets: [] });
      return;
    }
    const parsed = parseCompoundLength(raw);
    // Mid-typing states ("4200/") just don't dispatch yet.
    if (!parsed) return;
    patch({
      lengthMm: parsed.lengthMm,
      rebateInsets: parsed.rebateInsets,
      ...(parsed.hasBrick && { hasRebate: true })
    });
  };

  const row = index;
  const isLastRow = index === data.walls.length - 1;
  const onMeasurementKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Tab' && !event.shiftKey) {
      if (focusNav(row + 1, 0)) event.preventDefault();
      else if (isLastRow && canEdit && onAddWall) {
        event.preventDefault();
        onAddWall(wall.foundationId);
      }
    } else if (event.key === 'Tab' && event.shiftKey) {
      if (focusNav(row - 1, 0)) event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (focusNav(row + 1, 0)) event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      if (focusNav(row - 1, 0)) event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      if (input.selectionStart === input.value.length && focusNav(row, 1)) {
        event.preventDefault();
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <Row>
        <IconButton
          size="small"
          aria-label={`Reorder wall ${computed.number}`}
          sx={{ cursor: 'grab', touchAction: 'none' }}
          disabled={!canEdit}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Typography variant="body2" fontWeight={700} textAlign="center">
          {computed.number}
        </Typography>

        <Tooltip
          title="Length in mm, or segments: 4200/810b = 4200 bare, 810 brick (b/r = brick rebate)"
          enterDelay={800}
        >
          <TextField
            size="small"
            placeholder="mm"
            value={lengthDraft ?? canonicalLength}
            disabled={!canEdit}
            inputRef={lengthInputRef}
            inputProps={{
              'aria-label': `Wall ${computed.number} measurement`,
              'data-nav': navId(row, 0),
              onKeyDown: onMeasurementKeyDown
            }}
            onChange={(event) => onLengthChange(event.target.value)}
            onBlur={() => setLengthDraft(null)}
          />
        </Tooltip>

        <CornerToggle
          label={`Wall ${computed.number} start corner`}
          value={wall.cornerStart}
          disabled={!canEdit}
          row={row}
          col={1}
          onChange={(cornerStart) =>
            patch({
              cornerStart,
              // Absorb only applies at internal corners.
              ...(cornerStart === 'external' && { absorbShutterAtStart: false })
            })
          }
        />
        <CornerToggle
          label={`Wall ${computed.number} end corner`}
          value={wall.cornerEnd}
          disabled={!canEdit}
          row={row}
          col={2}
          onChange={(cornerEnd) =>
            patch({
              cornerEnd,
              ...(cornerEnd === 'external' && { absorbShutterAtEnd: false })
            })
          }
        />

        <BreakdownCell
          section="shutters"
          shutters={computed.shutters}
          isOverridden={computed.isOverridden}
          onEdit={canEdit ? () => setIsOverrideOpen(true) : undefined}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Brick rebate on/off for this wall">
            <Checkbox
              size="small"
              checked={wall.hasRebate && data.rebatesEnabled}
              disabled={!canEdit || !data.rebatesEnabled}
              inputProps={{ 'aria-label': `Wall ${computed.number} rebate on/off` }}
              onChange={(event) => patch({ hasRebate: event.target.checked })}
            />
          </Tooltip>
          <BreakdownCell
            section="rebate"
            rebateRuns={computed.rebate}
            isOverridden={computed.isOverridden}
            onEdit={canEdit ? () => setIsOverrideOpen(true) : undefined}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {computed.warnings.length > 0 && (
            <Tooltip title={computed.warnings.join(' ')}>
              <WarningAmberIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
          <IconButton
            size="small"
            aria-label={`More options for wall ${computed.number}`}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <ExpandMoreIcon
              fontSize="small"
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 150ms'
              }}
            />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`Remove wall ${computed.number}`}
            disabled={!canEdit}
            onClick={() => dispatch({ type: 'removeWall', id: wall.id })}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Row>

      <Collapse in={isExpanded} unmountOnExit>
        <DetailPanel>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'flex-end'
            }}
          >
          <TextField
            select
            size="small"
            label="Polystyrene short"
            value={polystyreneValue}
            disabled={!canEdit}
            sx={{ minWidth: '11rem' }}
            onChange={(event) => {
              const { value } = event.target;
              patch({
                polystyreneOverride: value === 'auto' ? null : value === 'true'
              });
            }}
            helperText={
              wall.polystyreneOverride === null && computed.polystyreneAuto
                ? 'Auto: on (both ends internal)'
                : undefined
            }
          >
            <MenuItem value="auto">Auto</MenuItem>
            <MenuItem value="true">On (p)</MenuItem>
            <MenuItem value="false">Off</MenuItem>
          </TextField>

          <TextField
            size="small"
            label="Notes"
            value={wall.notes}
            disabled={!canEdit}
            sx={{ flex: 1, minWidth: '14rem' }}
            onChange={(event) => patch({ notes: event.target.value })}
          />

          <OverrideEditor
            wall={wall}
            computed={computed}
            isOpen={isOverrideOpen}
            onOpen={() => setIsOverrideOpen(true)}
            onClose={() => setIsOverrideOpen(false)}
          />
          </Box>

          <Divider />
          <RebateInsetsEditor wall={wall} />

          <Divider />
          <OpeningsEditor wall={wall} />

          <Divider />

          <Box sx={{ width: '100%' }}>
            <Button
              size="small"
              color="inherit"
              sx={{ color: 'text.secondary', textTransform: 'none' }}
              startIcon={
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{
                    transform: showAdvanced ? 'rotate(180deg)' : 'none',
                    transition: 'transform 150ms'
                  }}
                />
              }
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              Advanced corner adjustments (auto-managed)
            </Button>
            <Collapse in={showAdvanced} unmountOnExit>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem 1.5rem',
                  alignItems: 'center',
                  pt: 1
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.rebate.offsetAtStart}
                      disabled={!canEdit || !wall.hasRebate}
                      onChange={(event) =>
                        patch({ rebateOffsetAtStart: event.target.checked })
                      }
                    />
                  }
                  label={`−${rules.rebateWidthMm} at start${auto(wall.rebateOffsetAtStart)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.rebate.offsetAtEnd}
                      disabled={!canEdit || !wall.hasRebate}
                      onChange={(event) =>
                        patch({ rebateOffsetAtEnd: event.target.checked })
                      }
                    />
                  }
                  label={`−${rules.rebateWidthMm} at end${auto(wall.rebateOffsetAtEnd)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.rebate.extendAtStart}
                      disabled={!canEdit || !wall.hasRebate}
                      onChange={(event) =>
                        patch({ rebateExtendAtStart: event.target.checked })
                      }
                    />
                  }
                  label={`+${rules.rebateWidthMm} at start${auto(wall.rebateExtendAtStart)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.rebate.extendAtEnd}
                      disabled={!canEdit || !wall.hasRebate}
                      onChange={(event) =>
                        patch({ rebateExtendAtEnd: event.target.checked })
                      }
                    />
                  }
                  label={`+${rules.rebateWidthMm} at end${auto(wall.rebateExtendAtEnd)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.absorbAtStart}
                      disabled={!canEdit}
                      onChange={(event) =>
                        patch({ absorbShutterAtStart: event.target.checked })
                      }
                    />
                  }
                  label={`Absorb ${rules.shutterThicknessMm}mm at start${auto(wall.absorbShutterAtStart)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.absorbAtEnd}
                      disabled={!canEdit}
                      onChange={(event) =>
                        patch({ absorbShutterAtEnd: event.target.checked })
                      }
                    />
                  }
                  label={`Absorb ${rules.shutterThicknessMm}mm at end${auto(wall.absorbShutterAtEnd)}`}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ends.overhangCapAtEnd}
                      disabled={!canEdit}
                      onChange={(event) =>
                        patch({ overhangCapAtEnd: event.target.checked })
                      }
                    />
                  }
                  label={`Overhang cap at end${auto(wall.overhangCapAtEnd)}`}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Corner angle °"
                  value={wall.angledCornerDeg ?? ''}
                  disabled={!canEdit}
                  sx={{ width: '8.5rem' }}
                  onChange={(event) => {
                    const raw = event.target.value;
                    patch({ angledCornerDeg: raw === '' ? null : Number(raw) });
                  }}
                  helperText="Only for non-90° corners"
                />
              </Box>
            </Collapse>
          </Box>
        </DetailPanel>
      </Collapse>
    </div>
  );
});

WallRow.displayName = 'WallRow';
