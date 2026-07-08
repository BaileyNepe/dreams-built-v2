import { BLK_KEY, SHORTS_KEY } from '@dreams-built/shared/src/jobsheet/engine/tallies';
import { type Tally } from '@dreams-built/shared/src/jobsheet/types';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { type FC } from 'react';
import { SECTION_COLORS, type SheetSection } from './constants';
import { useJobSheetContext } from './state/JobSheetProvider';

const TITLES: Record<SheetSection, string> = {
  shutters: '300 Shutters',
  rebate: 'Rebate Shutters'
};

/** Live totals for one section: each standard size, shorts, and BLKs. */
export const TallyPanel: FC<{ section: SheetSection }> = ({ section }) => {
  const { computed, rules } = useJobSheetContext();
  const tally: Tally = computed.tallies[section];

  const sizes = [...rules.standardSizesMm].sort((a, b) => b - a);

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Typography
        variant="subtitle2"
        sx={{
          background: SECTION_COLORS[section].header,
          color: '#000',
          fontWeight: 700,
          textAlign: 'center',
          py: 0.5
        }}
      >
        {TITLES[section]}
      </Typography>
      <Table size="small" data-testid={`tally-${section}`}>
        <TableHead>
          <TableRow>
            <TableCell>Size</TableCell>
            <TableCell align="right">Qty</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sizes.map((size) => (
            <TableRow key={size}>
              <TableCell>{size}</TableCell>
              <TableCell align="right">{tally[String(size)] || '-'}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Shorts</TableCell>
            <TableCell align="right">{tally[SHORTS_KEY] || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>BLK</TableCell>
            <TableCell align="right">{tally[BLK_KEY] || '-'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};
