import { type FloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

/**
 * Collapsible floor-plan panel: a scale drawing of the slab with the
 * shutter and rebate boxing, doubling as validation — if the walls don't
 * close the perimeter, the gap is drawn and measured.
 */
export const FloorPlanPanel: FC<{
  outline: FloorOutline;
  includeInPrint: boolean;
  onIncludeInPrintChange: (value: boolean) => void;
}> = ({ outline, includeInPrint, onIncludeInPrintChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasWalls = outline.walls.length > 0;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
          Floor plan
        </Typography>

        {outline.misclosureMm > 1 && (
          <Tooltip title="The wall measurements and corner directions don't return to the start point — check lengths and internal/external corners. The gap is drawn dashed red.">
            <Chip
              icon={<WarningAmberIcon />}
              size="small"
              color="warning"
              label={`Doesn't close by ${outline.misclosureMm.toLocaleString()}mm`}
              data-testid="misclosure-chip"
            />
          </Tooltip>
        )}

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
          <Box sx={{ maxWidth: '52rem', mx: 'auto' }}>
            <FloorPlanSvg outline={outline} />
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
