import { formatCut } from '@dreams-built/shared/src/jobsheet/engine/format';
import { type Cut, type PackedRun } from '@dreams-built/shared/src/jobsheet/types';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { type FC, Fragment } from 'react';
import { SECTION_COLORS, type SheetSection } from '../constants';

const cutChipStyle = (cut: Cut, section: SheetSection) => {
  if (cut.kind === 'short') {
    return {
      backgroundColor: SECTION_COLORS[section].highlight,
      fontWeight: 700
    };
  }
  if (cut.kind === 'blk') {
    return { backgroundColor: 'transparent', border: '1px dashed', fontWeight: 600 };
  }
  return {};
};

const CutChips: FC<{ cuts: Cut[]; section: SheetSection }> = ({ cuts, section }) => (
  <>
    {cuts.map((cut, index) => (
      <Chip
        // Cuts have no identity of their own; position is the only key.
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        label={formatCut(cut)}
        size="small"
        sx={cutChipStyle(cut, section)}
      />
    ))}
  </>
);

/**
 * One wall's computed pieces for one section, as chips: standard sizes
 * plain, shorts highlighted in the section colour (with "p"/angle suffixes),
 * BLK dashed, plus an overhang caption. Rebate segments are separated by a
 * thin divider; an empty rebate renders as "-" like the paper sheet.
 */
export const BreakdownCell: FC<{
  section: SheetSection;
  shutters?: PackedRun;
  rebateRuns?: PackedRun[];
  isOverridden?: boolean;
}> = ({ section, shutters, rebateRuns, isOverridden = false }) => {
  const isEmpty =
    section === 'shutters'
      ? (shutters?.cuts.length ?? 0) === 0
      : (rebateRuns ?? []).every((run) => run.cuts.length === 0);

  return (
    <Box
      data-testid={`breakdown-${section}`}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.5,
        minHeight: 32
      }}
    >
      {isOverridden && (
        <Tooltip title="Manually overridden — not auto-recomputed">
          <Chip
            icon={<EditIcon />}
            label="edited"
            size="small"
            color="warning"
            variant="outlined"
            data-testid="override-badge"
          />
        </Tooltip>
      )}

      {section === 'shutters' && shutters && (
        <>
          <CutChips cuts={shutters.cuts} section={section} />
          {shutters.overhangMm > 0 && (
            <Tooltip title="Overhang past the wall end">
              <Typography variant="caption" color="text.secondary">
                +{shutters.overhangMm}
              </Typography>
            </Tooltip>
          )}
        </>
      )}

      {section === 'rebate' &&
        (rebateRuns ?? []).map((run, index) => (
          // Segments are positional; there is nothing more stable to key by.
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>
            {index > 0 && (
              <Typography variant="caption" color="text.disabled">
                |
              </Typography>
            )}
            <CutChips cuts={run.cuts} section={section} />
          </Fragment>
        ))}

      {isEmpty && !isOverridden && (
        <Typography variant="body2" color="text.disabled">
          -
        </Typography>
      )}
    </Box>
  );
};
