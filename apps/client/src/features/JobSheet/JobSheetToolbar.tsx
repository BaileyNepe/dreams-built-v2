import { jobSheetRulesSchema } from '@dreams-built/shared/src/jobsheet/types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GridOnIcon from '@mui/icons-material/GridOn';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import SyncIcon from '@mui/icons-material/Sync';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip
} from '@mui/material';
import { useActiveRulesQuery, useRefreshRulesMutation } from 'api/jobsheets';
import { useMemo, useState, type FC } from 'react';
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
    projectId,
    rules,
    applyServerSheet,
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

  const activeRules = useActiveRulesQuery();
  const refreshRules = useRefreshRulesMutation({ projectId });

  const rulesAreStale = useMemo(() => {
    if (!activeRules.data) return false;
    try {
      const active = jobSheetRulesSchema.parse(activeRules.data.data);
      return JSON.stringify(active) !== JSON.stringify(rules);
    } catch {
      return false;
    }
  }, [activeRules.data, rules]);

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

      {rulesAreStale && canEdit && (
        <Tooltip title="The global rules changed since this sheet was created. Update the sheet to use them (non-overridden walls recompute).">
          <Button
            size="small"
            color="warning"
            startIcon={<SyncIcon />}
            disabled={refreshRules.isPending}
            onClick={() =>
              refreshRules.mutate(
                { sheetId },
                { onSuccess: (sheet) => applyServerSheet(sheet) }
              )
            }
          >
            Use latest rules
          </Button>
        </Tooltip>
      )}

      <Button size="small" startIcon={<PrintIcon />} onClick={onPrint}>
        Print
      </Button>
      <Tooltip title="Download the sheet (and floor plan) as a PDF">
        <Button
          size="small"
          startIcon={<PictureAsPdfIcon />}
          disabled={isExportingPdf}
          onClick={exportPdf}
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

      <SnapshotsDrawer open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <RulesDialog open={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <InstructionsDialog
        open={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </Box>
  );
};
