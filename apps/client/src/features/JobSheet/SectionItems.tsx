import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { type FC } from 'react';
import { useJobSheetContext } from './state/JobSheetProvider';
import { type SectionKey } from './state/jobSheetReducer';

const TITLES: Record<SectionKey, string> = {
  joinery: 'Joinery',
  showerBoxes: 'Shower Boxes',
  garage: 'Garage'
};

/** Simple add/remove item list (free text + optional qty), one per box on the sheet. */
export const SectionItems: FC<{ section: SectionKey }> = ({ section }) => {
  const { data, dispatch, canEdit } = useJobSheetContext();
  const items = data[section];

  return (
    <Paper variant="outlined" sx={{ p: 1.5, display: 'grid', gap: 1 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {TITLES[section]}
      </Typography>

      {items.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            value={item.text}
            placeholder="Item"
            disabled={!canEdit}
            fullWidth
            inputProps={{ 'aria-label': `${TITLES[section]} item` }}
            onChange={(event) =>
              dispatch({
                type: 'updateItem',
                section,
                id: item.id,
                patch: { text: event.target.value }
              })
            }
          />
          <TextField
            size="small"
            type="number"
            value={item.qty ?? ''}
            placeholder="Qty"
            disabled={!canEdit}
            sx={{ width: '5.5rem' }}
            inputProps={{ min: 1, 'aria-label': `${TITLES[section]} quantity` }}
            onChange={(event) => {
              const raw = event.target.value;
              dispatch({
                type: 'updateItem',
                section,
                id: item.id,
                patch: { qty: raw === '' ? null : Math.max(1, Math.floor(Number(raw))) }
              });
            }}
          />
          <IconButton
            size="small"
            aria-label={`Remove ${TITLES[section]} item`}
            disabled={!canEdit}
            onClick={() => dispatch({ type: 'removeItem', section, id: item.id })}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {items.length === 0 && (
        <Typography variant="body2" color="text.disabled">
          Nothing yet
        </Typography>
      )}

      {canEdit && (
        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{ justifySelf: 'start' }}
          onClick={() =>
            dispatch({ type: 'addItem', section, id: crypto.randomUUID() })
          }
        >
          Add
        </Button>
      )}
    </Paper>
  );
};
