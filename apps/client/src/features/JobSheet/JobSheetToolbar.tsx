import { jobSheetRulesSchema } from '@dreams-built/shared/src/jobsheet/types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HistoryIcon from '@mui/icons-material/History';
import PrintIcon from '@mui/icons-material/Print';
import SyncIcon from '@mui/icons-material/Sync';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, Button, Chip, CircularProgress, Tooltip } from '@mui/material';
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

export const JobSheetToolbar: FC<{ onPrint: () => void }> = ({ onPrint }) => {
  const { canEdit, saveStatus, retrySave, sheetId, projectId, rules, applyServerSheet } =
    useJobSheetContext();

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
