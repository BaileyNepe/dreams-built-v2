import {
  type CornerIssue,
  type FloorOutline
} from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { type JobSheetRules } from '@dreams-built/shared/src/jobsheet/types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import JoinFullIcon from '@mui/icons-material/JoinFull';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { useState, type FC } from 'react';
import { FloorPlanSvg } from './FloorPlanSvg';

const issueLabel = (issue: CornerIssue): string => {
  const walls = `Walls ${issue.wallNumber}→${issue.nextWallNumber}`;
  switch (issue.kind) {
    case 'shutter-overlap':
      return `${walls}: shutters overlap`;
    case 'shutter-gap':
      return `${walls}: shutter gap`;
    case 'rebate-overlap':
      return `${walls}: rebates overlap`;
    default:
      return `${walls}: rebate gap`;
  }
};

const isOverlap = (issue: CornerIssue) => issue.kind.endsWith('overlap');

/**
 * Collapsible floor-plan panel: a scale drawing of the slab with the
 * shutter and rebate boxing in physical contact, doubling as validation —
 * a perimeter that doesn't close, boards overlapping at a corner, or a
 * corner gap are all flagged (concrete escapes through gaps; two boards
 * can't occupy the same space).
 */
export const FloorPlanPanel: FC<{
  outline: FloorOutline;
  rules: JobSheetRules;
  includeInPrint: boolean;
  onIncludeInPrintChange: (value: boolean) => void;
  onDrawSpan?: (wallId: string, fromMm: number, toMm: number) => void;
}> = ({ outline, rules, includeInPrint, onIncludeInPrintChange, onDrawSpan }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasWalls = outline.walls.length > 0;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
          Floor plan
        </Typography>

        {outline.loops
          .filter((loop) => loop.misclosureMm > 1)
          .map((loop) => (
            <Tooltip
              key={loop.foundationId}
              title="The wall measurements and corner directions don't return to the start point — check lengths and internal/external corners. The gap is drawn dashed red."
            >
              <Chip
                icon={<WarningAmberIcon />}
                size="small"
                color="warning"
                label={`${
                  outline.loops.length > 1
                    ? `${loop.name || `Foundation ${outline.loops.indexOf(loop) + 1}`}: doesn't`
                    : "Doesn't"
                } close by ${loop.misclosureMm.toLocaleString()}mm`}
                data-testid="misclosure-chip"
              />
            </Tooltip>
          ))}

        {outline.cornerIssues.map((issue) => (
          <Tooltip key={`${issue.kind}-${issue.wallNumber}`} title={issue.message}>
            <Chip
              icon={isOverlap(issue) ? <JoinFullIcon /> : <SpaceBarIcon />}
              size="small"
              color={isOverlap(issue) ? 'error' : 'warning'}
              label={issueLabel(issue)}
              data-testid="corner-issue-chip"
            />
          </Tooltip>
        ))}

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={includeInPrint}
              onChange={(event) => onIncludeInPrintChange(event.target.checked)}
            />
          }
          label="Include in print"
        />
        <IconButton
          size="small"
          aria-label="Toggle floor plan"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 150ms'
            }}
          />
        </IconButton>
      </Box>

      <Collapse in={isExpanded} unmountOnExit>
        {hasWalls ? (
          <Box sx={{ width: '100%' }}>
            <FloorPlanSvg outline={outline} rules={rules} onDrawSpan={onDrawSpan} />
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            Add walls to see the floor outline.
          </Typography>
        )}
      </Collapse>
    </Paper>
  );
};
