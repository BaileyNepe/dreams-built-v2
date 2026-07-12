import {
  jobSheetRulesSchema,
  type JobSheetRules
} from '@dreams-built/shared/src/jobsheet/types';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import { useRefreshRulesMutation, useUpdateSheetRulesMutation } from 'api/jobsheets';
import BasicModal from 'components/Modal';
import { useState, type FC } from 'react';
import { useJobSheetContext } from './state/JobSheetProvider';

const parseSizes = (raw: string): number[] =>
  raw
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

type Draft = {
  sizesText: string;
  shutterThicknessMm: string;
  rebateWidthMm: string;
  blkLengthMm: string;
  autoPolystyreneWhenBothEndsInternal: boolean;
  shutterLabel: string;
  rebateLabel: string;
};

const toDraft = (rules: JobSheetRules): Draft => ({
  sizesText: [...rules.standardSizesMm].sort((a, b) => b - a).join(', '),
  shutterThicknessMm: String(rules.shutterThicknessMm),
  rebateWidthMm: String(rules.rebateWidthMm),
  blkLengthMm: String(rules.blkLengthMm),
  autoPolystyreneWhenBothEndsInternal: rules.autoPolystyreneWhenBothEndsInternal,
  shutterLabel: rules.shutterLabel,
  rebateLabel: rules.rebateLabel
});

const fromDraft = (draft: Draft): unknown => ({
  standardSizesMm: parseSizes(draft.sizesText),
  shutterThicknessMm: Number(draft.shutterThicknessMm),
  rebateWidthMm: Number(draft.rebateWidthMm),
  blkLengthMm: Number(draft.blkLengthMm),
  autoPolystyreneWhenBothEndsInternal: draft.autoPolystyreneWhenBothEndsInternal,
  shutterLabel: draft.shutterLabel.trim() || '300 Shutters',
  rebateLabel: draft.rebateLabel.trim() || 'Rebate'
});

const RulesForm: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { sheetId, projectId, rules, applyServerSheet } = useJobSheetContext();
  const update = useUpdateSheetRulesMutation({ projectId });
  const reset = useRefreshRulesMutation({ projectId });
  const [draft, setDraft] = useState<Draft>(() => toDraft(rules));
  const [error, setError] = useState<string | null>(null);

  const sizes = parseSizes(draft.sizesText);
  const smallest = Math.min(...sizes);
  const hasIrregularSizes =
    sizes.length > 0 &&
    Number.isFinite(smallest) &&
    sizes.some((size) => size % smallest !== 0);

  const save = () => {
    const parsed = jobSheetRulesSchema.safeParse(fromDraft(draft));
    if (!parsed.success) {
      setError(parsed.error.errors.map((issue) => issue.message).join(', '));
      return;
    }
    update.mutate(
      { sheetId, data: parsed.data },
      {
        onSuccess: (sheet) => {
          applyServerSheet(sheet);
          onClose();
        }
      }
    );
  };

  const resetToDefaults = () => {
    reset.mutate(
      { sheetId },
      {
        onSuccess: (sheet) => {
          applyServerSheet(sheet);
          onClose();
        }
      }
    );
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Alert severity="info">
        These rules apply to <strong>this sheet only</strong> — the shared defaults
        that new sheets start from are never changed here. Non-overridden walls
        recompute when you save.
      </Alert>

      <TextField
        label="Standard sizes (mm)"
        value={draft.sizesText}
        onChange={(event) => setDraft({ ...draft, sizesText: event.target.value })}
        helperText="Comma-separated, e.g. 4800, 4200, 3600, 3000, 2400, 1800, 1200, 600"
      />
      {hasIrregularSizes && (
        <Alert severity="warning">
          Sizes aren&apos;t all multiples of the smallest ({smallest}mm) — overhang
          promotion may pick a much larger piece than expected.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* TODO(bailey): confirm the real-world default values for these. */}
        <TextField
          label="Shutter width (mm)"
          type="number"
          value={draft.shutterThicknessMm}
          sx={{ width: '10rem' }}
          onChange={(event) =>
            setDraft({ ...draft, shutterThicknessMm: event.target.value })
          }
          helperText="Absorbed at internal corners"
        />
        <TextField
          label="Rebate width (mm)"
          type="number"
          value={draft.rebateWidthMm}
          sx={{ width: '10rem' }}
          onChange={(event) => setDraft({ ...draft, rebateWidthMm: event.target.value })}
          helperText="Offset at crossing brick faces"
        />
        <TextField
          label="BLK length (mm)"
          type="number"
          value={draft.blkLengthMm}
          sx={{ width: '10rem' }}
          onChange={(event) => setDraft({ ...draft, blkLengthMm: event.target.value })}
          helperText="Inset piece length"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Shutter column label"
          value={draft.shutterLabel}
          sx={{ width: '14rem' }}
          onChange={(event) => setDraft({ ...draft, shutterLabel: event.target.value })}
          helperText='The "300" is the shutter height'
        />
        <TextField
          label="Rebate column label"
          value={draft.rebateLabel}
          sx={{ width: '14rem' }}
          onChange={(event) => setDraft({ ...draft, rebateLabel: event.target.value })}
          helperText="Heading only — widths unchanged"
        />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={draft.autoPolystyreneWhenBothEndsInternal}
            onChange={(event) =>
              setDraft({
                ...draft,
                autoPolystyreneWhenBothEndsInternal: event.target.checked
              })
            }
          />
        }
        label='Automatically flag shorts as polystyrene ("p") when both wall ends are internal'
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          size="small"
          color="inherit"
          startIcon={<RestartAltIcon />}
          sx={{ color: 'text.secondary' }}
          disabled={reset.isPending}
          onClick={resetToDefaults}
        >
          Reset to defaults
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          Save for this sheet
        </Button>
      </Box>
    </Box>
  );
};

export const RulesDialog: FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose
}) => (
  <BasicModal open={open} onClose={onClose} title="Calculation rules" width="34rem">
    {open ? <RulesForm onClose={onClose} /> : <Typography />}
  </BasicModal>
);
