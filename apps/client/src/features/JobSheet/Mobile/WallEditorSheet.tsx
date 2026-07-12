import { type CornerKind, type Wall } from '@dreams-built/shared/src/jobsheet/types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useState, type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { OpeningsEditor } from '../WallTable/OpeningsEditor';
import { OverrideEditor } from '../WallTable/OverrideEditor';
import { RebateInsetsEditor } from '../WallTable/RebateInsetsEditor';
import { useWallLengthField } from '../WallTable/useWallLengthField';
import { BoardRun } from './BoardRun';

/** Big touch-friendly Ext|Int selector for one corner. */
const CornerControl: FC<{
  label: string;
  value: CornerKind;
  onChange: (value: CornerKind) => void;
}> = ({ label, value, onChange }) => (
  <Box sx={{ flex: 1, minWidth: '9rem' }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    <ToggleButtonGroup
      exclusive
      fullWidth
      color="primary"
      value={value}
      onChange={(_event, next: CornerKind | null) => {
        if (next) onChange(next);
      }}
    >
      <ToggleButton value="external" sx={{ py: 1.1, textTransform: 'none' }}>
        External
      </ToggleButton>
      <ToggleButton value="internal" sx={{ py: 1.1, textTransform: 'none' }}>
        Internal
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>
);

/** The measurement field with its own state per wall (remounts on id). */
const MeasurementField: FC<{
  wall: Wall;
  patch: (fields: Partial<Wall>) => void;
}> = ({ wall, patch }) => {
  const field = useWallLengthField(wall, patch);
  return (
    <TextField
      fullWidth
      placeholder="mm"
      value={field.value}
      onChange={(event) => field.onChange(event.target.value)}
      onBlur={field.onBlur}
      helperText="4200/810b = 4200 bare, 810 brick (b/r = brick rebate)"
      inputProps={{
        'aria-label': 'Wall measurement',
        style: {
          fontSize: '1.5rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums'
        }
      }}
    />
  );
};

/**
 * Bottom-sheet wall editor: one wall at a time with room to breathe, and
 * prev/next to walk the slab entering measurements without leaving the
 * keyboard flow.
 */
export const WallEditorSheet: FC<{
  wallId: string | null;
  onClose: () => void;
  onNavigate: (wallId: string) => void;
}> = ({ wallId, onClose, onNavigate }) => {
  const { data, computed, rules, dispatch } = useJobSheetContext();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const index = data.walls.findIndex((w) => w.id === wallId);
  const wall = index === -1 ? null : data.walls[index];
  const computedWall = index === -1 ? null : computed.walls[index];

  const patch = (fields: Partial<Wall>) => {
    if (wall) dispatch({ type: 'updateWall', id: wall.id, patch: fields });
  };

  // Prev/next and reorder stay inside the wall's own foundation loop.
  const neighbour = (offset: -1 | 1): Wall | null => {
    const other = data.walls[index + offset];
    return other ?? null;
  };
  const canMove = (offset: -1 | 1) =>
    wall !== null && neighbour(offset)?.foundationId === wall.foundationId;

  const polystyreneValue =
    wall === null || wall.polystyreneOverride === null
      ? 'auto'
      : String(wall.polystyreneOverride);

  return (
    <Drawer
      anchor="bottom"
      open={wall !== null}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '92dvh'
        }
      }}
    >
      {wall && computedWall && (
        <Box sx={{ p: 2, pb: 4, overflowY: 'auto' }}>
          {/* Grab handle */}
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 2,
              bgcolor: 'divider',
              mx: 'auto',
              mb: 1.5
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Wall {computedWall.number}
              <Typography component="span" variant="body2" color="text.secondary">
                {' '}
                of {data.walls.length}
              </Typography>
            </Typography>
            <IconButton
              aria-label="Previous wall"
              disabled={index === 0}
              onClick={() => onNavigate(data.walls[index - 1].id)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Next wall"
              disabled={index === data.walls.length - 1}
              onClick={() => onNavigate(data.walls[index + 1].id)}
            >
              <ChevronRightIcon />
            </IconButton>
            <IconButton aria-label="Close wall editor" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <MeasurementField key={wall.id} wall={wall} patch={patch} />

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
            <CornerControl
              label="Start corner"
              value={wall.cornerStart}
              onChange={(cornerStart) =>
                patch({
                  cornerStart,
                  // Absorb only applies at internal corners.
                  ...(cornerStart === 'external' && { absorbShutterAtStart: false })
                })
              }
            />
            <CornerControl
              label="End corner"
              value={wall.cornerEnd}
              onChange={(cornerEnd) =>
                patch({
                  cornerEnd,
                  ...(cornerEnd === 'external' && { absorbShutterAtEnd: false })
                })
              }
            />
          </Box>

          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={wall.hasRebate && data.rebatesEnabled}
                disabled={!data.rebatesEnabled}
                onChange={(event) => patch({ hasRebate: event.target.checked })}
              />
            }
            label="Brick rebate on this wall"
          />

          {/* Live result the crew will read off the card. */}
          <Box
            sx={{
              display: 'grid',
              gap: 0.75,
              mt: 1.5,
              p: 1.25,
              borderRadius: 2,
              bgcolor: 'action.hover'
            }}
          >
            <BoardRun
              section="shutters"
              tag={rules.shutterLabel.split(' ')[0] || 'SHU'}
              runs={[computedWall.shutters.cuts]}
              overhangMm={computedWall.shutters.overhangMm}
            />
            <BoardRun
              section="rebate"
              tag="REB"
              runs={computedWall.rebate.map((run) => run.cuts)}
              emptyText={wall.hasRebate && data.rebatesEnabled ? '—' : 'no rebate'}
            />
            {computedWall.warnings.length > 0 && (
              <Typography variant="caption" color="warning.main">
                {computedWall.warnings.join(' ')}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Wall notes"
            value={wall.notes}
            sx={{ mt: 2 }}
            onChange={(event) => patch({ notes: event.target.value })}
          />

          <Button
            size="small"
            color="inherit"
            sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none' }}
            startIcon={
              <ExpandMoreIcon
                sx={{
                  transform: showAdvanced ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms'
                }}
              />
            }
            onClick={() => setShowAdvanced((previous) => !previous)}
          >
            Openings, brick stops &amp; overrides
          </Button>
          <Collapse in={showAdvanced} unmountOnExit>
            <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
              <TextField
                select
                size="small"
                label="Polystyrene short"
                value={polystyreneValue}
                sx={{ maxWidth: '12rem' }}
                onChange={(event) => {
                  const { value } = event.target;
                  patch({
                    polystyreneOverride: value === 'auto' ? null : value === 'true'
                  });
                }}
              >
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="true">On (p)</MenuItem>
                <MenuItem value="false">Off</MenuItem>
              </TextField>
              <Divider />
              <RebateInsetsEditor wall={wall} />
              <Divider />
              <OpeningsEditor wall={wall} />
              <Divider />
              <OverrideEditor
                wall={wall}
                computed={computedWall}
                isOpen={isOverrideOpen}
                onOpen={() => setIsOverrideOpen(true)}
                onClose={() => setIsOverrideOpen(false)}
              />
            </Box>
          </Collapse>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              color="inherit"
              startIcon={<KeyboardArrowUpIcon />}
              disabled={!canMove(-1)}
              onClick={() => dispatch({ type: 'moveWall', from: index, to: index - 1 })}
            >
              Move up
            </Button>
            <Button
              size="small"
              color="inherit"
              startIcon={<KeyboardArrowDownIcon />}
              disabled={!canMove(1)}
              onClick={() => dispatch({ type: 'moveWall', from: index, to: index + 1 })}
            >
              Move down
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                dispatch({ type: 'removeWall', id: wall.id });
                onClose();
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
