import { diffSheets, type SheetDiff } from '@dreams-built/shared/src/jobsheet/engine/diff';
import {
  snapshotBlobSchema,
  type SnapshotBlob
} from '@dreams-built/shared/src/jobsheet/types';
import {
  Box,
  Chip,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useSnapshot, useSnapshots } from 'api/jobsheets';
import BasicModal from 'components/Modal';
import { useMemo, useState, type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';

const CURRENT = 'current';

/** Resolve a picker selection to a snapshot blob ('current' = live sheet). */
const useBlobFor = (selection: string, live: SnapshotBlob): SnapshotBlob | null => {
  const snapshot = useSnapshot(selection === CURRENT ? null : selection);
  return useMemo(() => {
    if (selection === CURRENT) return live;
    if (!snapshot.data) return null;
    return snapshotBlobSchema.parse(snapshot.data.blob);
  }, [selection, snapshot.data, live]);
};

const TallyDeltas: FC<{ title: string; deltas: Record<string, number> }> = ({
  title,
  deltas
}) => {
  const keys = Object.keys(deltas);
  if (keys.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2" fontWeight={600}>
        {title}:
      </Typography>
      {keys.map((key) => (
        <Chip
          key={key}
          size="small"
          label={`${key} ${deltas[key] > 0 ? '+' : ''}${deltas[key]}`}
          color={deltas[key] > 0 ? 'success' : 'error'}
          variant="outlined"
        />
      ))}
    </Box>
  );
};

const ItemChanges: FC<{ title: string; diff: SheetDiff['items']['joinery'] }> = ({
  title,
  diff
}) => {
  if (!diff.added.length && !diff.removed.length && !diff.changed.length) return null;
  return (
    <Typography variant="body2">
      <strong>{title}:</strong>{' '}
      {[
        ...diff.added.map((label) => `+ ${label}`),
        ...diff.removed.map((label) => `− ${label}`),
        ...diff.changed
      ].join('; ')}
    </Typography>
  );
};

export const SnapshotCompareDialog: FC<{
  open: boolean;
  onClose: () => void;
  initialBefore?: string;
}> = ({ open, onClose, initialBefore }) => {
  const { sheetId, data, rules } = useJobSheetContext();
  const snapshots = useSnapshots(sheetId, { enabled: open });

  const [beforeSel, setBeforeSel] = useState(initialBefore ?? CURRENT);
  const [afterSel, setAfterSel] = useState(CURRENT);

  const live = useMemo<SnapshotBlob>(
    () => ({ data, rules, computed: undefined }),
    [data, rules]
  );
  const beforeBlob = useBlobFor(beforeSel, live);
  const afterBlob = useBlobFor(afterSel, live);

  const diff = useMemo(
    () => (beforeBlob && afterBlob ? diffSheets(beforeBlob, afterBlob) : null),
    [beforeBlob, afterBlob]
  );

  const options = [
    { value: CURRENT, label: 'Current sheet' },
    ...(snapshots.data ?? []).map((snapshot) => ({
      value: snapshot.id,
      label: `v${snapshot.version}${snapshot.label ? ` — ${snapshot.label}` : ''}`
    }))
  ];

  return (
    <BasicModal open={open} onClose={onClose} title="Compare versions" width="52rem">
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            size="small"
            label="From"
            value={beforeSel}
            sx={{ flex: 1 }}
            onChange={(event) => setBeforeSel(event.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="To"
            value={afterSel}
            sx={{ flex: 1 }}
            onChange={(event) => setAfterSel(event.target.value)}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {!diff && <Skeleton variant="rectangular" height={160} />}

        {diff?.isEmpty && (
          <Typography color="text.secondary">No differences.</Typography>
        )}

        {diff && !diff.isEmpty && (
          <>
            {diff.walls.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Wall</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diff.walls.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {(entry.after ?? entry.before)?.number}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            entry.status === 'changed'
                              ? entry.changedFields.join(', ')
                              : entry.status
                          }
                          color={
                            // eslint-disable-next-line no-nested-ternary
                            entry.status === 'added'
                              ? 'success'
                              : entry.status === 'removed'
                                ? 'error'
                                : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {entry.before &&
                          `${entry.before.lengthMm}mm · ${entry.before.shutters} · ${entry.before.rebate}`}
                      </TableCell>
                      <TableCell>
                        {entry.after &&
                          `${entry.after.lengthMm}mm · ${entry.after.shutters} · ${entry.after.rebate}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <TallyDeltas title="300 Shutters tally" deltas={diff.tallies.shutters} />
            <TallyDeltas title="Rebate tally" deltas={diff.tallies.rebate} />
            <ItemChanges title="Joinery" diff={diff.items.joinery} />
            <ItemChanges title="Shower Boxes" diff={diff.items.showerBoxes} />
            <ItemChanges title="Garage" diff={diff.items.garage} />
          </>
        )}
      </Box>
    </BasicModal>
  );
};
