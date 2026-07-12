import { formatCut } from '@dreams-built/shared/src/jobsheet/engine/format';
import { type Cut } from '@dreams-built/shared/src/jobsheet/types';
import { Box, Typography } from '@mui/material';
import { Fragment, type FC } from 'react';
import { styled } from 'styled-components';
import { SECTION_COLORS, type SheetSection } from '../constants';

/**
 * A packed run drawn the way it exists on site: boards butting end-to-end,
 * a joint line where one piece meets the next. Shorts are filled in the
 * section colour, BLK insets dashed, sub-runs (split by a garage door)
 * separated by a real gap. This is the mobile card's way of reading a
 * cut list at a glance.
 */

const Strip = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  row-gap: 0.3rem;
`;

const Board = styled.span<{ $fill?: string; $dashed?: boolean }>`
  background: ${(p) => p.$fill ?? p.theme.palette.action.hover};
  border: 1px solid ${(p) => (p.$dashed ? p.theme.palette.text.secondary : '#9a938a')};
  border-style: ${(p) => (p.$dashed ? 'dashed' : 'solid')};
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
  padding: 0.15rem 0.55rem;
  white-space: nowrap;

  /* Boards butt together: share the joint line, round only the run ends. */
  & + & {
    margin-left: -1px;
  }
  &:first-child {
    border-radius: 6px 0 0 6px;
  }
  &:last-child {
    border-radius: 0 6px 6px 0;
  }
  &:only-child {
    border-radius: 6px;
  }
`;

const Rail = styled.span<{ $color: string }>`
  align-self: stretch;
  background: ${(p) => p.$color};
  border-radius: 2px;
  flex-shrink: 0;
  width: 4px;
`;

const Tag = styled.span`
  color: ${(p) => p.theme.palette.text.secondary};
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.9;
  min-width: 2.1rem;
`;

const boardFill = (cut: Cut, section: SheetSection): string | undefined => {
  if (cut.kind === 'short') return SECTION_COLORS[section].highlight;
  if (cut.kind === 'blk') return 'transparent';
  return undefined;
};

export const BoardRun: FC<{
  section: SheetSection;
  tag: string;
  /** One inner array per sub-run (openings split rebate runs). */
  runs: Cut[][];
  overhangMm?: number;
  /** Rendered when every sub-run is empty, e.g. "no rebate". */
  emptyText?: string;
}> = ({ section, tag, runs, overhangMm = 0, emptyText = '—' }) => {
  const isEmpty = runs.every((run) => run.length === 0);

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
      <Rail $color={SECTION_COLORS[section].header} />
      <Tag>{tag}</Tag>
      {isEmpty ? (
        <Typography variant="body2" color="text.disabled" sx={{ lineHeight: 1.9 }}>
          {emptyText}
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: 1,
            rowGap: 0.3,
            minWidth: 0
          }}
        >
          {runs.map((run, runIndex) =>
            run.length === 0 ? null : (
              // Sub-runs are positional; nothing more stable to key by.
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={runIndex}>
                {runIndex > 0 && (
                  <Typography variant="caption" color="text.disabled">
                    |
                  </Typography>
                )}
                <Strip>
                  {run.map((cut, index) => (
                    <Board
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      $fill={boardFill(cut, section)}
                      $dashed={cut.kind === 'blk'}
                      style={cut.kind === 'short' ? { fontWeight: 700 } : undefined}
                    >
                      {formatCut(cut)}
                    </Board>
                  ))}
                </Strip>
              </Fragment>
            )
          )}
          {overhangMm > 0 && (
            <Typography variant="caption" color="text.secondary">
              +{overhangMm}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
