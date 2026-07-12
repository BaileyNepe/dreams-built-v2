import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GridOnIcon from '@mui/icons-material/GridOn';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import TuneIcon from '@mui/icons-material/Tune';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  useCreateSnapshotMutation,
  useSnapshotIfChangedMutation
} from 'api/jobsheets';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { useJobSheetContext } from './state/JobSheetProvider';
import { type SaveStatus } from './state/useAutosave';
import { InstructionsDialog } from './InstructionsDialog';
import { RulesDialog } from './RulesDialog';
import { SnapshotsDrawer } from './Snapshots/SnapshotsDrawer';

const SaveChip: FC<{ status: SaveStatus; onRetry: () => void }> = ({
  status,
  onRetry
}) => {
  switch (status) {
    case 'saving':
      return (
        <Chip
          size="small"
          icon={<CircularProgress size={14} />}
          label="Saving…"
          variant="outlined"
        />
      );
    case 'pending':
      return <Chip size="small" label="Unsaved changes" variant="outlined" />;
    case 'offline':
      return (
        <Tooltip title="No connection — changes are stored on this device and will sync automatically when you're back online.">
          <Chip size="small" color="warning" label="Offline — saved locally" />
        </Tooltip>
      );
    case 'error':
      return (
        <Chip
          size="small"
          color="error"
          label="Save failed — retry"
          onClick={onRetry}
        />
      );
    case 'conflict':
      return (
        <Tooltip title="This sheet was changed in another tab or by someone else.">
          <Chip
            size="small"
            color="error"
            label="Changed elsewhere — reload"
            onClick={() => window.location.reload()}
          />
        </Tooltip>
      );
    default:
      return (
        <Chip
          size="small"
          icon={<CheckCircleOutlineIcon />}
          label="Saved"
          variant="outlined"
          color="success"
        />
      );
  }
};

export const JobSheetToolbar: FC<{
  onPrint: () => void;
  onPrintBlank: () => void;
  onExportPdf: () => Promise<void>;
}> = ({ onPrint, onPrintBlank, onExportPdf }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await onExportPdf();
    } finally {
      setIsExportingPdf(false);
    }
  };
  const {
    canEdit,
    saveStatus,
    retrySave,
    sheetId,
    data,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo
  } = useJobSheetContext();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Small screens collapse the action buttons into one overflow menu.
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const closeMenuThen = (action: () => void) => () => {
    setMenuAnchor(null);
    action();
  };

  const createSnapshot = useCreateSnapshotMutation({ sheetId });
  const snapshotIfChanged = useSnapshotIfChangedMutation({ sheetId });

  // Snapshots always capture the SAVED sheet: pending edits are flushed
  // first and the snapshot fires once the save lands, so it never records
  // stale data. 'quick' (Cmd/Ctrl+S) always writes a version; 'ifChanged'
  // (print / PDF export) only when content moved since the last snapshot.
  type SnapshotRequest = { kind: 'quick' } | { kind: 'ifChanged'; label: string };
  const pendingSnapshot = useRef<SnapshotRequest | null>(null);
  const { mutate: createSnapshotMutate } = createSnapshot;
  const { mutate: snapshotIfChangedMutate } = snapshotIfChanged;
  const fireSnapshot = useCallback(
    (request: SnapshotRequest) => {
      if (request.kind === 'quick') {
        createSnapshotMutate({ sheetId, label: 'Quick save' });
      } else {
        snapshotIfChangedMutate({ sheetId, label: request.label });
      }
    },
    [createSnapshotMutate, snapshotIfChangedMutate, sheetId]
  );
  useEffect(() => {
    if (saveStatus === 'saved' && pendingSnapshot.current) {
      const request = pendingSnapshot.current;
      pendingSnapshot.current = null;
      fireSnapshot(request);
    }
  }, [saveStatus, fireSnapshot]);
  const requestSnapshot = (request: SnapshotRequest) => {
    if (!canEdit || pendingSnapshot.current) return;
    if (saveStatus === 'saved') {
      fireSnapshot(request);
    } else {
      pendingSnapshot.current = request;
      retrySave();
    }
  };

  useEffect(() => {
    if (!canEdit) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      if (pendingSnapshot.current) return;
      if (saveStatus === 'saved') {
        createSnapshotMutate({ sheetId, label: 'Quick save' });
      } else {
        pendingSnapshot.current = { kind: 'quick' };
        retrySave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canEdit, saveStatus, sheetId, createSnapshotMutate, retrySave]);

  // Record what leaves the app: printing or exporting snapshots the sheet
  // when it differs from the last recorded version.
  const printWithRecord = () => {
    requestSnapshot({ kind: 'ifChanged', label: 'Printed' });
    onPrint();
  };
  const exportPdfWithRecord = () => {
    requestSnapshot({ kind: 'ifChanged', label: 'PDF export' });
    return exportPdf();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}
    >
      <SaveChip status={saveStatus} onRetry={retrySave} />

      {canEdit && (
        <>
          <Tooltip title="Undo (Cmd+Z)">
            <span>
              <IconButton size="small" onClick={undo} disabled={!canUndo} aria-label="Undo">
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Shift+Cmd+Z)">
            <span>
              <IconButton size="small" onClick={redo} disabled={!canRedo} aria-label="Redo">
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Manual mode: free-form sheet for one-off difficult plans — click pieces in per column, no corner logic or floor plan">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={data.mode === 'manual'}
                  onChange={(event) =>
                    dispatch({
                      type: 'setMode',
                      value: event.target.checked ? 'manual' : 'auto'
                    })
                  }
                />
              }
              label="Manual"
            />
          </Tooltip>
          {data.mode === 'manual' ? (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={data.manualThirdColumn}
                  onChange={(event) =>
                    dispatch({
                      type: 'setManualThirdColumn',
                      value: event.target.checked
                    })
                  }
                />
              }
              label="3rd column"
            />
          ) : (
            <Tooltip title="Master switch: off computes every wall without brick rebate">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={data.rebatesEnabled}
                    onChange={(event) =>
                      dispatch({ type: 'setRebatesEnabled', value: event.target.checked })
                    }
                  />
                }
                label="Rebates"
              />
            </Tooltip>
          )}
        </>
      )}

      {isCompact ? (
        <>
          <IconButton
            size="small"
            aria-label="Sheet actions"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={menuAnchor !== null}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={closeMenuThen(printWithRecord)}>
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print</ListItemText>
            </MenuItem>
            <MenuItem
              disabled={isExportingPdf}
              onClick={closeMenuThen(exportPdfWithRecord)}
            >
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Download PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={closeMenuThen(onPrintBlank)}>
              <ListItemIcon>
                <GridOnIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print blank sheet</ListItemText>
            </MenuItem>
            <MenuItem onClick={closeMenuThen(() => setIsHistoryOpen(true))}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>History</ListItemText>
            </MenuItem>
            {canEdit && (
              <MenuItem onClick={closeMenuThen(() => setIsRulesOpen(true))}>
                <ListItemIcon>
                  <TuneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Rules</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={closeMenuThen(() => setIsInstructionsOpen(true))}>
              <ListItemIcon>
                <HelpOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Instructions</ListItemText>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Button size="small" startIcon={<PrintIcon />} onClick={printWithRecord}>
            Print
          </Button>
          <Tooltip title="Download the sheet (and floor plan) as a PDF">
            <Button
              size="small"
              startIcon={<PictureAsPdfIcon />}
              disabled={isExportingPdf}
              onClick={exportPdfWithRecord}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Print an empty sheet to fill in by hand">
            <Button size="small" startIcon={<GridOnIcon />} onClick={onPrintBlank}>
              Blank
            </Button>
          </Tooltip>
          <Button
            size="small"
            startIcon={<HistoryIcon />}
            onClick={() => setIsHistoryOpen(true)}
          >
            History
          </Button>
          {canEdit && (
            <Button
              size="small"
              startIcon={<TuneIcon />}
              onClick={() => setIsRulesOpen(true)}
            >
              Rules
            </Button>
          )}
          <Button
            size="small"
            startIcon={<HelpOutlineIcon />}
            onClick={() => setIsInstructionsOpen(true)}
          >
            Instructions
          </Button>
        </>
      )}

      <SnapshotsDrawer open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <RulesDialog open={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <InstructionsDialog
        open={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </Box>
  );
};
