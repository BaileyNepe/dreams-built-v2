import { type ComputedWall, type Wall } from '@dreams-built/shared/src/jobsheet/types';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, ButtonBase, Chip, Tooltip, Typography } from '@mui/material';
import { memo, type FC } from 'react';
import { styled } from 'styled-components';
import { canonicalLengthOf } from '../WallTable/useWallLengthField';
import { BoardRun } from './BoardRun';

/**
 * One wall as a glanceable site card: the number the crew writes on the
 * boards, the measurement as the headline, then the two runs as boards
 * laid end-to-end. Tap anywhere to edit.
 */

const NumberBadge = styled.span`
  align-items: center;
  border: 2px solid ${(p) => p.theme.palette.text.primary};
  border-radius: 6px;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  height: 2rem;
  justify-content: center;
  min-width: 2rem;
  padding: 0 0.2rem;
`;

const cornerText = (wall: Wall) => {
  const short = (kind: Wall['cornerStart']) => (kind === 'internal' ? 'Int' : 'Ext');
  return { start: short(wall.cornerStart), end: short(wall.cornerEnd) };
};

export const WallCard: FC<{
  wall: Wall;
  computed: ComputedWall;
  shutterTag: string;
  rebateTag: string;
  rebatesEnabled: boolean;
  onOpen?: () => void;
}> = memo(({ wall, computed, shutterTag, rebateTag, rebatesEnabled, onOpen }) => {
  const measurement = canonicalLengthOf(wall);
  const corners = cornerText(wall);
  const hasRebate = wall.hasRebate && rebatesEnabled;

  return (
    <ButtonBase
      component="div"
      onClick={onOpen}
      disabled={!onOpen}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        px: 1.5,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&.Mui-disabled': { opacity: 1 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
        <NumberBadge>
          {computed.number}
          {wall.isGarageDoorWall ? ' ⌂' : ''}
        </NumberBadge>

        {measurement === '' ? (
          <Typography color="text.disabled" sx={{ fontStyle: 'italic' }}>
            {onOpen ? 'tap to enter measurement' : 'no measurement'}
          </Typography>
        ) : (
          <Typography
            component="span"
            sx={{
              fontSize: '1.35rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
              overflowWrap: 'anywhere'
            }}
          >
            {measurement}
            <Typography component="span" variant="caption" color="text.secondary">
              {' '}
              mm
            </Typography>
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          <Box
            component="span"
            sx={{ fontWeight: wall.cornerStart === 'internal' ? 800 : 400 }}
          >
            {corners.start}
          </Box>
          {' · '}
          <Box
            component="span"
            sx={{ fontWeight: wall.cornerEnd === 'internal' ? 800 : 400 }}
          >
            {corners.end}
          </Box>
        </Typography>

        {computed.warnings.length > 0 && (
          <Tooltip title={computed.warnings.join(' ')}>
            <WarningAmberIcon color="warning" sx={{ fontSize: '1.1rem' }} />
          </Tooltip>
        )}
        {computed.isOverridden && (
          <Chip
            icon={<EditIcon />}
            label="edited"
            size="small"
            color="warning"
            variant="outlined"
            data-testid="override-badge"
          />
        )}
        {onOpen && (
          <ChevronRightIcon sx={{ fontSize: '1.2rem', color: 'text.disabled' }} />
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 0.5, pl: 0.25 }}>
        <BoardRun
          section="shutters"
          tag={shutterTag}
          runs={[computed.shutters.cuts]}
          overhangMm={computed.shutters.overhangMm}
        />
        <BoardRun
          section="rebate"
          tag={rebateTag}
          runs={computed.rebate.map((run) => run.cuts)}
          emptyText={hasRebate ? '—' : 'no rebate'}
        />
      </Box>
    </ButtonBase>
  );
});

WallCard.displayName = 'WallCard';
