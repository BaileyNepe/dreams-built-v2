import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  useCreateSnapshotMutation,
  useRestoreSnapshotMutation,
  useSnapshots
} from 'api/jobsheets';
import { ConfirmationDialog } from 'components/ConfirmationDialog';
import { useState, type FC } from 'react';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { SnapshotCompareDialog } from './SnapshotCompareDialog';
import { SnapshotViewDialog } from './SnapshotViewDialog';

/**
 * Version history: save labelled snapshots, view/compare them, and restore.
 * Restoring snapshots the current state first (server-side, same
 * transaction) so nothing is ever lost.
 */
export const SnapshotsDrawer: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => {
  const { sheetId, projectId, canEdit, applyServerSheet } = useJobSheetContext();
  const snapshots = useSnapshots(sheetId, { enabled: open });
  const createSnapshot = useCreateSnapshotMutation({ sheetId });
  const restoreSnapshot = useRestoreSnapshotMutation({ sheetId, projectId });

  const [label, setLabel] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<{
    id: string;
    version: number;
  } | null>(null);

  const saveSnapshot = () => {
    createSnapshot.mutate(
      { sheetId, label: label.trim() || undefined },
      { onSuccess: () => setLabel('') }
    );
  };

  const confirmRestore = () => {
    if (!restoreTarget) return;
    restoreSnapshot.mutate(
      { sheetId, snapshotId: restoreTarget.id },
      {
        onSuccess: (sheet) => {
          applyServerSheet(sheet);
          setRestoreTarget(null);
        }
      }
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 'min(26rem, 90vw)', p: 2, display: 'grid', gap: 2 }}>
        <Typography variant="h6">Sheet history</Typography>

        {canEdit && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Label (optional)"
              value={label}
              fullWidth
              onChange={(event) => setLabel(event.target.value)}
              inputProps={{ maxLength: 120 }}
            />
            <Button
              variant="contained"
              onClick={saveSnapshot}
              disabled={createSnapshot.isPending}
            >
              Save
            </Button>
          </Box>
        )}

        <Divider />

        {snapshots.isLoading && <Skeleton variant="rectangular" height={120} />}

        {snapshots.data?.length === 0 && (
          <Typography color="text.secondary">
            No snapshots yet. Save one before making big changes.
          </Typography>
        )}

        <List dense disablePadding>
          {(snapshots.data ?? []).map((snapshot) => (
            <ListItem
              key={snapshot.id}
              divider
              secondaryAction={
                <Box>
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      aria-label={`View snapshot v${snapshot.version}`}
                      onClick={() => setViewId(snapshot.id)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Compare">
                    <IconButton
                      size="small"
                      aria-label={`Compare snapshot v${snapshot.version}`}
                      onClick={() => {
                        setCompareId(snapshot.id);
                        setIsCompareOpen(true);
                      }}
                    >
                      <CompareArrowsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canEdit && (
                    <Tooltip title="Restore">
                      <IconButton
                        size="small"
                        aria-label={`Restore snapshot v${snapshot.version}`}
                        onClick={() =>
                          setRestoreTarget({
                            id: snapshot.id,
                            version: snapshot.version
                          })
                        }
                      >
                        <RestoreIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              }
            >
              <ListItemText
                primary={`v${snapshot.version}${
                  snapshot.label ? ` — ${snapshot.label}` : ''
                }`}
                secondary={`${new Date(snapshot.createdAt).toLocaleString()}${
                  snapshot.createdBy
                    ? ` · ${snapshot.createdBy.firstName} ${snapshot.createdBy.lastName}`
                    : ''
                }`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <SnapshotViewDialog snapshotId={viewId} onClose={() => setViewId(null)} />
      <SnapshotCompareDialog
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialBefore={compareId ?? undefined}
      />
      <ConfirmationDialog
        open={restoreTarget !== null}
        title={`Restore v${restoreTarget?.version}?`}
        message="The sheet will be reset to this version. Your current state is snapshotted first, so nothing is lost."
        confirmText="Restore"
        onConfirm={confirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </Drawer>
  );
};
