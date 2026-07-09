import {
  type Opening,
  type OpeningKind,
  type Wall
} from '@dreams-built/shared/src/jobsheet/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';

const KIND_LABELS: Record<OpeningKind, string> = {
  garage_door: 'Garage door',
  entry_door: 'Entry door',
  sliding_door: 'Sliding door',
  stacker: 'Stacker',
  window: 'Window',
  other: 'Other'
};

const newOpening = (): Opening => ({
  kind: 'garage_door',
  widthMm: 0,
  offsetFromStartMm: 0,
  hasRebate: false,
  blk: false
});

/**
 * Openings along a wall (garage doors, sliders, entry doors…). An opening
 * with "Has rebate" unticked splits the wall's rebate run around it — e.g.
 * a rebate wall with a garage door gets no rebate across the door's width.
 * A wall can hold any number of openings (floors with multiple garages).
 */
export const OpeningsEditor: FC<{ wall: Wall }> = ({ wall }) => {
  const { dispatch, canEdit } = useJobSheetContext();

  const setOpenings = (openings: Opening[]) =>
    dispatch({ type: 'updateWall', id: wall.id, patch: { openings } });

  const updateOpening = (index: number, patch: Partial<Opening>) =>
    setOpenings(
      wall.openings.map((opening, i) =>
        i === index ? { ...opening, ...patch } : opening
      )
    );

  return (
    <Box sx={{ display: 'grid', gap: 1, width: '100%' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Openings (joinery)
      </Typography>

      {wall.openings.map((opening, index) => (
        <Box
          // Openings are positional entries on the wall.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <TextField
            select
            size="small"
            label="Type"
            value={opening.kind}
            disabled={!canEdit}
            sx={{ width: '9.5rem' }}
            onChange={(event) =>
              updateOpening(index, { kind: event.target.value as OpeningKind })
            }
          >
            {Object.entries(KIND_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            label="Width mm"
            value={opening.widthMm === 0 ? '' : opening.widthMm}
            disabled={!canEdit}
            sx={{ width: '7.5rem' }}
            error={opening.widthMm <= 0}
            onChange={(event) =>
              updateOpening(index, {
                widthMm: Math.max(0, Math.floor(Number(event.target.value) || 0))
              })
            }
          />
          <Tooltip title="Distance from the wall's start corner to the opening">
            <TextField
              size="small"
              type="number"
              label="Offset mm"
              value={opening.offsetFromStartMm}
              disabled={!canEdit}
              sx={{ width: '7.5rem' }}
              onChange={(event) =>
                updateOpening(index, {
                  offsetFromStartMm: Math.max(
                    0,
                    Math.floor(Number(event.target.value) || 0)
                  )
                })
              }
            />
          </Tooltip>
          <Tooltip title="Unticked: the rebate run is split around this opening">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={opening.hasRebate}
                  disabled={!canEdit}
                  onChange={(event) =>
                    updateOpening(index, { hasRebate: event.target.checked })
                  }
                />
              }
              label="Has rebate"
            />
          </Tooltip>
          <TextField
            size="small"
            label="Label"
            value={opening.label ?? ''}
            disabled={!canEdit}
            sx={{ width: '10rem' }}
            onChange={(event) =>
              updateOpening(index, { label: event.target.value || undefined })
            }
          />
          <IconButton
            size="small"
            aria-label="Remove opening"
            disabled={!canEdit}
            onClick={() => setOpenings(wall.openings.filter((_, i) => i !== index))}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {canEdit && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{ justifySelf: 'start' }}
          onClick={() => setOpenings([...wall.openings, newOpening()])}
        >
          Add opening
        </Button>
      )}
    </Box>
  );
};
