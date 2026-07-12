import { type FloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { wallLoops } from '@dreams-built/shared/src/jobsheet/engine/loops';
import AddIcon from '@mui/icons-material/Add';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FoundationIcon from '@mui/icons-material/Foundation';
import FunctionsIcon from '@mui/icons-material/Functions';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Fab,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useState, type FC } from 'react';
import { FloorPlanPanel } from '../FloorPlan';
import { SectionItems } from '../SectionItems';
import { useJobSheetContext } from '../state/JobSheetProvider';
import { TallyPanel } from '../TallyPanel';
import { WallTable } from '../WallTable';
import { WallCard } from './WallCard';
import { WallEditorSheet } from './WallEditorSheet';

type MobileSection = 'walls' | 'plan' | 'totals';

const MobileWalls: FC<{
  onOpenWall: (wallId: string) => void;
}> = ({ onOpenWall }) => {
  const { data, computed, rules, dispatch, canEdit } = useJobSheetContext();
  const loops = wallLoops(data);
  const showDividers = loops.length > 1;
  const shutterTag = rules.shutterLabel.split(' ')[0] || 'SHU';

  return (
    <Box>
      {loops.map((loop, loopIndex) => (
        <Box key={loop.foundationId}>
          {showDividers && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                px: 1.5,
                pt: 2,
                pb: 0.5
              }}
            >
              <Typography variant="subtitle2" fontWeight={800}>
                {loop.name ||
                  (loopIndex === 0 ? 'Main foundation' : `Foundation ${loopIndex + 1}`)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {loop.walls.length} wall{loop.walls.length === 1 ? '' : 's'}
              </Typography>
            </Box>
          )}
          {loop.walls.map((wall, i) => {
            const index = loop.startIndex + i;
            return (
              <WallCard
                key={wall.id}
                wall={wall}
                computed={computed.walls[index]}
                shutterTag={shutterTag}
                rebateTag="REB"
                rebatesEnabled={data.rebatesEnabled}
                onOpen={canEdit ? () => onOpenWall(wall.id) : undefined}
              />
            );
          })}
        </Box>
      ))}

      {data.walls.length === 0 && (
        <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
          No walls yet. Wall 1 is the garage-door wall; add walls clockwise around
          the foundation.
        </Typography>
      )}

      {canEdit && (
        <Button
          size="small"
          color="secondary"
          startIcon={<AddIcon />}
          sx={{ m: 1.5 }}
          onClick={() =>
            dispatch({
              type: 'addFoundation',
              id: crypto.randomUUID(),
              wallId: crypto.randomUUID()
            })
          }
        >
          Add external foundation
        </Button>
      )}
    </Box>
  );
};

/**
 * The phone/tablet experience: three focused screens behind a bottom nav —
 * the wall cut list, the floor plan, and the totals/order — instead of one
 * endless scroll. Editing happens in a bottom sheet, one wall at a time.
 */
export const MobileJobSheet: FC<{
  outline: FloorOutline;
  planInPrint: boolean;
  onPlanInPrintChange: (value: boolean) => void;
  onDrawSpan?: (wallId: string, fromMm: number, toMm: number) => void;
}> = ({ outline, planInPrint, onPlanInPrintChange, onDrawSpan }) => {
  const { data, computed, rules, dispatch, canEdit } = useJobSheetContext();
  const [section, setSection] = useState<MobileSection>('walls');
  const [openWallId, setOpenWallId] = useState<string | null>(null);

  const isManual = data.mode === 'manual';

  // New walls join the last foundation and open straight into the editor.
  const addWall = () => {
    const id = crypto.randomUUID();
    const lastWall = data.walls[data.walls.length - 1];
    dispatch({ type: 'addWall', id, foundationId: lastWall?.foundationId });
    setOpenWallId(id);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {section === 'walls' &&
        (isManual ? (
          <WallTable />
        ) : (
          <MobileWalls onOpenWall={setOpenWallId} />
        ))}

      {section === 'plan' &&
        (isManual ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            Manual sheets have no floor plan — corner logic is off.
          </Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            <FloorPlanPanel
              outline={outline}
              rules={rules}
              includeInPrint={planInPrint}
              onIncludeInPrintChange={onPlanInPrintChange}
              onDrawSpan={canEdit ? onDrawSpan : undefined}
            />
          </Box>
        ))}

      {section === 'totals' && (
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <TallyPanel section="shutters" />
            </Grid>
            <Grid item xs={6}>
              <TallyPanel section="rebate" />
            </Grid>
            {computed.tallies.extra && (
              <Grid item xs={6}>
                <TallyPanel section="extra" />
              </Grid>
            )}
          </Grid>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1.5 }}>
            <SectionItems section="joinery" />
            <SectionItems section="showerBoxes" />
            <SectionItems section="garage" />
            <TextField
              label="Sheet notes"
              multiline
              minRows={2}
              value={data.notes}
              disabled={!canEdit}
              onChange={(event) =>
                dispatch({ type: 'setNotes', notes: event.target.value })
              }
            />
          </Box>
        </Box>
      )}

      {canEdit && section === 'walls' && !isManual && (
        <Fab
          color="primary"
          aria-label="Add wall"
          onClick={addWall}
          sx={{ position: 'fixed', right: 16, bottom: 76, zIndex: 1050 }}
        >
          <AddIcon />
        </Fab>
      )}

      <Paper
        elevation={8}
        sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1100 }}
      >
        <BottomNavigation
          showLabels
          value={section}
          onChange={(_event, next: MobileSection) => setSection(next)}
        >
          <BottomNavigationAction
            label="Walls"
            value="walls"
            icon={<FormatListNumberedIcon />}
          />
          <BottomNavigationAction label="Plan" value="plan" icon={<FoundationIcon />} />
          <BottomNavigationAction
            label="Totals"
            value="totals"
            icon={<FunctionsIcon />}
          />
        </BottomNavigation>
      </Paper>

      <WallEditorSheet
        wallId={openWallId}
        onClose={() => setOpenWallId(null)}
        onNavigate={setOpenWallId}
      />
    </Box>
  );
};
