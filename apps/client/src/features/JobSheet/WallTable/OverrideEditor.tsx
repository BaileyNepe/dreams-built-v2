import {
  type ComputedWall,
  type Cut,
  type Wall
} from '@dreams-built/shared/src/jobsheet/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import BasicModal from 'components/Modal';
import { useEffect, useState, type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';

type CutDraft = Cut;

const newCut = (): CutDraft => ({ kind: 'standard', lengthMm: 600, polystyrene: false });

const CutEditor: FC<{
  cut: CutDraft;
  onChange: (cut: CutDraft) => void;
  onRemove: () => void;
}> = ({ cut, onChange, onRemove }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <TextField
      select
      size="small"
      label="Kind"
      value={cut.kind}
      sx={{ width: '8rem' }}
      onChange={(event) => {
        const kind = event.target.value as Cut['kind'];
        onChange({
          ...cut,
          kind,
          ...(kind !== 'short' && { polystyrene: false, angleDeg: undefined })
        });
      }}
    >
      <MenuItem value="standard">Standard</MenuItem>
      <MenuItem value="short">Short</MenuItem>
      <MenuItem value="blk">BLK</MenuItem>
    </TextField>
    <TextField
      size="small"
      type="number"
      label="mm"
      value={cut.lengthMm === 0 ? '' : cut.lengthMm}
      sx={{ width: '7rem' }}
      inputProps={{ min: 1 }}
      onChange={(event) =>
        onChange({
          ...cut,
          lengthMm: Math.max(0, Math.floor(Number(event.target.value) || 0))
        })
      }
      error={cut.lengthMm <= 0}
    />
    {cut.kind === 'short' && (
      <>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={cut.polystyrene}
              onChange={(event) => onChange({ ...cut, polystyrene: event.target.checked })}
            />
          }
          label="p"
        />
        <TextField
          size="small"
          type="number"
          label="Angle °"
          value={cut.angleDeg ?? ''}
          sx={{ width: '6.5rem' }}
          onChange={(event) => {
            const raw = event.target.value;
            onChange({ ...cut, angleDeg: raw === '' ? undefined : Number(raw) });
          }}
        />
      </>
    )}
    <IconButton size="small" aria-label="Remove piece" onClick={onRemove}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  </Box>
);

const CutListEditor: FC<{
  title: string;
  cuts: CutDraft[];
  onChange: (cuts: CutDraft[]) => void;
}> = ({ title, cuts, onChange }) => (
  <Box sx={{ display: 'grid', gap: 1 }}>
    <Typography variant="subtitle2">{title}</Typography>
    {cuts.map((cut, index) => (
      <CutEditor
        // Draft cuts are positional; there is no stable identity to key by.
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        cut={cut}
        onChange={(next) => onChange(cuts.map((c, i) => (i === index ? next : c)))}
        onRemove={() => onChange(cuts.filter((_, i) => i !== index))}
      />
    ))}
    <Button
      size="small"
      startIcon={<AddIcon />}
      onClick={() => onChange([...cuts, newCut()])}
      sx={{ justifySelf: 'start' }}
    >
      Add piece
    </Button>
  </Box>
);

/**
 * Manual override of a wall's computed breakdown. Opens seeded with the
 * current pieces; saving stores them verbatim on the wall (the engine stops
 * recomputing until "Reset to computed" removes the override).
 */
export const OverrideEditor: FC<{
  wall: Wall;
  computed: ComputedWall;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}> = ({ wall, computed, isOpen, onOpen, onClose }) => {
  const { dispatch, canEdit, rules } = useJobSheetContext();
  const [shutterCuts, setShutterCuts] = useState<CutDraft[]>([]);
  const [rebateRuns, setRebateRuns] = useState<CutDraft[][]>([]);

  // Seed the drafts whenever the editor opens (from the button or by
  // clicking a breakdown chip).
  useEffect(() => {
    if (!isOpen) return;
    setShutterCuts(wall.override?.shutterCuts ?? computed.shutters.cuts);
    setRebateRuns(wall.override?.rebateRuns ?? computed.rebate.map((run) => run.cuts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isValid =
    shutterCuts.every((cut) => cut.lengthMm > 0) &&
    rebateRuns.every((run) => run.every((cut) => cut.lengthMm > 0));

  const save = () => {
    dispatch({
      type: 'setOverride',
      id: wall.id,
      override: {
        shutterCuts,
        rebateRuns: rebateRuns.filter((run) => run.length > 0),
        note: wall.override?.note ?? ''
      }
    });
    onClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" variant="outlined" disabled={!canEdit} onClick={onOpen}>
          {wall.override ? 'Edit override' : 'Override breakdown'}
        </Button>
        {wall.override && (
          <Button
            size="small"
            color="warning"
            disabled={!canEdit}
            onClick={() => dispatch({ type: 'setOverride', id: wall.id, override: null })}
          >
            Reset to computed
          </Button>
        )}
      </Box>

      <BasicModal
        open={isOpen}
        onClose={onClose}
        title={`Override wall ${computed.number} breakdown`}
        width="38rem"
      >
        <Box sx={{ display: 'grid', gap: 2 }}>
          <CutListEditor
            title={rules.shutterLabel}
            cuts={shutterCuts}
            onChange={setShutterCuts}
          />
          <Divider />
          {rebateRuns.map((run, index) => (
            <CutListEditor
              // Segments are positional by nature.
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              title={`Rebate segment ${index + 1}`}
              cuts={run}
              onChange={(cuts) =>
                setRebateRuns(rebateRuns.map((r, i) => (i === index ? cuts : r)))
              }
            />
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setRebateRuns([...rebateRuns, []])}
            sx={{ justifySelf: 'start' }}
          >
            Add rebate segment
          </Button>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" disabled={!isValid} onClick={save}>
              Save override
            </Button>
          </Box>
        </Box>
      </BasicModal>
    </>
  );
};
