import { type RebateInset, type Wall } from '@dreams-built/shared/src/jobsheet/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';

/**
 * Slab-edge insets: stretches where the brick (and its rebate) stops and
 * the edge steps back to the frame line. The shutter run steps with it,
 * capped by BLK insets at each mid-wall transition; a stretch running to a
 * wall end is open at the corner instead. Not joinery — see Openings for
 * garage doors and other full-height joinery.
 */
export const RebateInsetsEditor: FC<{ wall: Wall }> = ({ wall }) => {
  const { dispatch, canEdit, rules } = useJobSheetContext();

  const setInsets = (rebateInsets: RebateInset[]) =>
    dispatch({ type: 'updateWall', id: wall.id, patch: { rebateInsets } });

  const update = (index: number, patch: Partial<RebateInset>) =>
    setInsets(
      wall.rebateInsets.map((inset, i) => (i === index ? { ...inset, ...patch } : inset))
    );

  if (!wall.hasRebate) return null;

  return (
    <Box sx={{ display: 'grid', gap: 1, width: '100%' }}>
      <Tooltip title="Where the brick stops along this wall and the slab edge steps back to the frame line. BLK insets cap each mid-wall transition.">
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Rebate insets (brick stops)
        </Typography>
      </Tooltip>

      {wall.rebateInsets.map((inset, index) => (
        <Box
          // Positional entries on the wall.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <TextField
            size="small"
            type="number"
            label="From start mm"
            value={inset.offsetFromStartMm}
            disabled={!canEdit}
            sx={{ width: '8.5rem' }}
            onChange={(event) =>
              update(index, {
                offsetFromStartMm: Math.max(0, Math.floor(Number(event.target.value) || 0))
              })
            }
          />
          <TextField
            size="small"
            type="number"
            label="Width mm"
            value={inset.widthMm === 0 ? '' : inset.widthMm}
            disabled={!canEdit}
            sx={{ width: '7.5rem' }}
            placeholder="required"
            onChange={(event) =>
              update(index, {
                widthMm: Math.max(0, Math.floor(Number(event.target.value) || 0))
              })
            }
          />
          <Typography variant="caption" color="text.secondary">
            −{rules.rebateWidthMm}mm inset
            {inset.offsetFromStartMm + inset.widthMm >= wall.lengthMm &&
              ' · runs to the corner'}
          </Typography>
          <IconButton
            size="small"
            aria-label="Remove inset"
            disabled={!canEdit}
            onClick={() => setInsets(wall.rebateInsets.filter((_, i) => i !== index))}
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
          onClick={() => setInsets([...wall.rebateInsets, { offsetFromStartMm: 0, widthMm: 0 }])}
        >
          Add inset
        </Button>
      )}
    </Box>
  );
};
