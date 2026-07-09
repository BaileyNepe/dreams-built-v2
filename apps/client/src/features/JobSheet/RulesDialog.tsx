import {
  jobSheetRulesSchema,
  type JobSheetRules
} from '@dreams-built/shared/src/jobsheet/types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material';
import { useActiveRules, useUpdateRulesMutation } from 'api/jobsheets';
import BasicModal from 'components/Modal';
import { useState, type FC } from 'react';

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
};

const toDraft = (rules: JobSheetRules): Draft => ({
  sizesText: [...rules.standardSizesMm].sort((a, b) => b - a).join(', '),
  shutterThicknessMm: String(rules.shutterThicknessMm),
  rebateWidthMm: String(rules.rebateWidthMm),
  blkLengthMm: String(rules.blkLengthMm),
  autoPolystyreneWhenBothEndsInternal: rules.autoPolystyreneWhenBothEndsInternal
});

const fromDraft = (draft: Draft): unknown => ({
  standardSizesMm: parseSizes(draft.sizesText),
  shutterThicknessMm: Number(draft.shutterThicknessMm),
  rebateWidthMm: Number(draft.rebateWidthMm),
  blkLengthMm: Number(draft.blkLengthMm),
  autoPolystyreneWhenBothEndsInternal: draft.autoPolystyreneWhenBothEndsInternal
});

const RulesForm: FC<{ onClose: () => void }> = ({ onClose }) => {
  const activeRules = useActiveRules();
  const update = useUpdateRulesMutation();
  const [draft, setDraft] = useState<Draft>(() =>
    toDraft(jobSheetRulesSchema.parse(activeRules.data))
  );
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
      { id: activeRules.id, data: parsed.data },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Alert severity="info">
        Rules apply to <strong>new</strong> sheets (and sheets you explicitly update
        via &ldquo;Use latest rules&rdquo;). Existing sheets keep the rules they were
        created with.
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

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          Save rules
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
