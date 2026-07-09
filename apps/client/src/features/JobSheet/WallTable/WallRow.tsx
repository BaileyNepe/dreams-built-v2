import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { resolveEnds } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
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
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { memo, useEffect, useRef, useState, type FC } from 'react';
import { styled } from 'styled-components';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { BreakdownCell } from './BreakdownCell';
import { OpeningsEditor } from './OpeningsEditor';
import { OverrideEditor } from './OverrideEditor';
import { RebateInsetsEditor } from './RebateInsetsEditor';

const Row = styled.div`
  align-items: center;
  background: ${(p) => p.theme.palette.background.paper};
  border-bottom: 1px solid ${(p) => p.theme.palette.divider};
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 2rem 2rem 7.5rem 8.5rem 8.5rem 1fr 1fr 4.5rem;
  padding: 0.25rem 0.5rem;
`;

const DetailPanel = styled.div`
  align-items: center;
  background: ${(p) => p.theme.palette.action.hover};
  border-bottom: 1px solid ${(p) => p.theme.palette.divider};
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding: 0.5rem 0.5rem 0.75rem 4.5rem;
`;

const CornerSelect: FC<{
  label: string;
  value: CornerKind;
  disabled: boolean;
  onChange: (value: CornerKind) => void;
}> = ({ label, value, disabled, onChange }) => (
  <TextField
    select
    size="small"
    label={label}
    value={value}
    disabled={disabled}
    onChange={(event) => onChange(event.target.value as CornerKind)}
    fullWidth
  >
    <MenuItem value="external">External</MenuItem>
    <MenuItem value="internal">Internal</MenuItem>
  </TextField>
);

export const WallRow: FC<{
  wall: Wall;
  computed: ComputedWall;
  isNewlyAdded?: boolean;
}> = memo(({ wall, computed, isNewlyAdded = false }) => {
  const { dispatch, canEdit, rules, data } = useJobSheetContext();

  // Corner adjustments resolve automatically from the corner kinds; the
  // checkboxes show the resolved state and clicking forces an override.
  const index = data.walls.findIndex((w) => w.id === wall.id);
  const ends = resolveEnds(wall, {
    prev: data.walls[(index - 1 + data.walls.length) % data.walls.length],
    next: data.walls[(index + 1) % data.walls.length]
  });
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

        <TextField
          size="small"
          type="number"
          label="mm"
          value={wall.lengthMm === 0 ? '' : wall.lengthMm}
          disabled={!canEdit}
          inputRef={lengthInputRef}
          inputProps={{ min: 0, 'aria-label': `Wall ${computed.number} measurement` }}
          error={wall.lengthMm < 0}
          onChange={(event) => {
            const value = Math.max(0, Math.floor(Number(event.target.value) || 0));
            patch({ lengthMm: value });
          }}
        />

        <CornerSelect
          label="Start corner"
          value={wall.cornerStart}
          disabled={!canEdit}
          onChange={(cornerStart) =>
            patch({
              cornerStart,
              // Absorb only applies at internal corners.
              ...(cornerStart === 'external' && { absorbShutterAtStart: false })
            })
          }
        />
        <CornerSelect
          label="End corner"
          value={wall.cornerEnd}
          disabled={!canEdit}
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

          <RebateInsetsEditor wall={wall} />

          <OpeningsEditor wall={wall} />

          <Box sx={{ width: '100%' }}>
            <Button size="small" onClick={() => setShowAdvanced((prev) => !prev)}>
              {showAdvanced ? 'Hide' : 'Show'} advanced corner adjustments (auto-managed)
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
