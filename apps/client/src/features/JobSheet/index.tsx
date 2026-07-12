import { authz } from '@dreams-built/shared/src/auth/permissions';
import { computeJobSheet } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import { computeFloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { jobSheetDataSchema } from '@dreams-built/shared/src/jobsheet/types';
import DescriptionIcon from '@mui/icons-material/Description';
import { ChevronLeft } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useClient } from 'api/clients';
import { notify } from 'libs/Notify';
import { useCreateJobSheetMutation, useJobSheet } from 'api/jobsheets';
import { useProject } from 'api/projects';
import { PrintableContent } from 'components/PrintableContent';
import { usePrint } from 'components/PrintableContent/hooks';
import { Suspense, useMemo, useState, type FC } from 'react';
import { useAuth } from 'utils/contexts/AuthProvider';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useJobSheetParams } from '../../routes/_dashboard/dashboard/projects/jobsheet.$projectId';
import { FloorPlanPanel } from './FloorPlan';
import { FloorPlanSvg } from './FloorPlan/FloorPlanSvg';
import { JobSheetHeader } from './JobSheetHeader';
import { JobSheetToolbar } from './JobSheetToolbar';
import { MobileJobSheet } from './Mobile';
import { SectionItems } from './SectionItems';
import { SheetView } from './SheetView';
import { emptyWall } from './state/jobSheetReducer';
import { useJobSheetContext, JobSheetProvider } from './state/JobSheetProvider';
import { TallyPanel } from './TallyPanel';
import { WallTable } from './WallTable';

/** Everything inside the provider: toolbar, header, editor grid, print copy. */
const JobSheetEditor: FC = () => {
  const { projectId, data, rules, computed, dispatch, canEdit } = useJobSheetContext();
  const project = useProject(projectId);
  const client = useClient(project.clientId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [printMode, setPrintMode] = useState<'live' | 'blank'>('live');
  const { printRef, handlePrint } = usePrint<HTMLDivElement>({
    isPrimaryContent: true,
    onAfterPrint: () => setPrintMode('live')
  });

  // A hand-fill template: 16 empty numbered rows, empty tallies and boxes.
  const blank = useMemo(() => {
    const blankData = jobSheetDataSchema.parse({
      walls: Array.from({ length: 16 }, (_, i) => emptyWall(`blank-${i}`))
    });
    return { data: blankData, computed: computeJobSheet(blankData, rules) };
  }, [rules]);
  const printBlank = () => {
    setPrintMode('blank');
    // Let React commit the blank sheet into the printable subtree first.
    setTimeout(handlePrint, 60);
  };

  const outline = useMemo(
    () => computeFloorOutline(data, computed, rules),
    [data, computed, rules]
  );
  const [planInPrint, setPlanInPrint] = useState(true);

  // Drag along a wall in the plan to add an opening spanning that range.
  const handleDrawSpan = (wallId: string, fromMm: number, toMm: number) => {
    const wall = data.walls.find((w) => w.id === wallId);
    if (!wall) return;
    dispatch({
      type: 'updateWall',
      id: wallId,
      patch: {
        openings: [
          ...wall.openings,
          {
            kind: 'garage_door',
            widthMm: toMm - fromMm,
            offsetFromStartMm: fromMm,
            hasRebate: false,
            blk: false
          }
        ]
      }
    });
    const number = data.walls.findIndex((w) => w.id === wallId) + 1;
    notify(
      `Opening added to wall ${number} (${toMm - fromMm}mm) — set its type in the wall panel`,
      { type: 'success' }
    );
  };

  const handleExportPdf = async () => {
    try {
      const { exportJobSheetPdf } = await import('./Print/exportPdf');
      await exportJobSheetPdf({
        headerText: `${client.name} - ${project.address}, ${project.city}`,
        jobNumber: project.jobNumber,
        data,
        rules,
        computed,
        outline: data.mode === 'manual' ? undefined : outline,
        fileName: `Job ${project.jobNumber} - ${project.address} - job sheet.pdf`
      });
    } catch (error) {
      // eslint-disable-next-line no-console -- surfaced for support/debugging
      console.error('[jobsheet] PDF export failed', error);
      notify('PDF export failed', { type: 'error' });
    }
  };

  return (
    <>
      <JobSheetToolbar
        onPrint={handlePrint}
        onPrintBlank={printBlank}
        onExportPdf={handleExportPdf}
      />
      <JobSheetHeader />
      <Divider sx={{ my: 2 }} />

      {isMobile ? (
        <MobileJobSheet
          outline={outline}
          planInPrint={planInPrint}
          onPlanInPrintChange={setPlanInPrint}
          onDrawSpan={canEdit ? handleDrawSpan : undefined}
        />
      ) : (
        <>
          <WallTable />

          <Box sx={{ mt: 2, display: data.mode === 'manual' ? 'none' : undefined }}>
            <FloorPlanPanel
              outline={outline}
              rules={rules}
              includeInPrint={planInPrint}
              onIncludeInPrintChange={setPlanInPrint}
              onDrawSpan={canEdit ? handleDrawSpan : undefined}
            />
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3} md={2}>
              <TallyPanel section="shutters" />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TallyPanel section="rebate" />
            </Grid>
            {computed.tallies.extra && (
              <Grid item xs={6} sm={3} md={2}>
                <TallyPanel section="extra" />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={8}>
              <Stack spacing={2}>
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
              </Stack>
            </Grid>
          </Grid>

          {/* Breathing room so the sheet never touches the viewport bottom. */}
          <Box sx={{ pb: 8 }} />
        </>
      )}

      {/* Hidden on screen; cloned into #print by usePrint. */}
      <PrintableContent ref={printRef} isHidden orientation="portrait">
        <SheetView
          headerText={`${client.name} - ${project.address}, ${project.city}`}
          jobNumber={project.jobNumber}
          data={printMode === 'blank' ? blank.data : data}
          rules={rules}
          computed={printMode === 'blank' ? blank.computed : computed}
        />
        {/* Manual sheets have no meaningful outline (and the panel with the
            include-in-print toggle is hidden), so never print one. */}
        {printMode === 'live' &&
          planInPrint &&
          data.mode !== 'manual' &&
          outline.walls.length > 0 && (
          <div style={{ breakInside: 'avoid', paddingTop: '4mm' }}>
            <FloorPlanSvg outline={outline} rules={rules} />
          </div>
        )}
      </PrintableContent>
    </>
  );
};

const JobSheetContent: FC = () => {
  const { projectId } = useJobSheetParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user.permissions?.includes(authz.jobsheets_edit) || false;

  const sheet = useJobSheet(projectId);
  const createSheet = useCreateJobSheetMutation();
  const [wallCount, setWallCount] = useState('8');

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<ChevronLeft />}
          onClick={() =>
            navigate({ to: paths.projectsEdit, params: { projectId } })
          }
        >
          Back to Project
        </Button>
      </Box>

      {sheet ? (
        <JobSheetProvider
          key={sheet.id}
          sheet={sheet}
          projectId={projectId}
          canEdit={canEdit}
        >
          <JobSheetEditor />
        </JobSheetProvider>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" gutterBottom>
            No job sheet yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create the shutter &amp; rebate cut sheet for this job.
          </Typography>
          {canEdit && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: 'center',
                // Align the button with the input box itself — the helper
                // text below the field would otherwise skew centring.
                alignItems: 'flex-start'
              }}
            >
              <TextField
                size="small"
                type="number"
                label="Walls"
                value={wallCount}
                sx={{ width: '6rem' }}
                inputProps={{ min: 0, max: 50 }}
                onChange={(event) => setWallCount(event.target.value)}
                helperText="Rows to start with"
              />
              <Button
                variant="contained"
                disabled={createSheet.isPending}
                sx={{ height: 40 }}
                onClick={() =>
                  createSheet.mutate({
                    projectId,
                    wallCount: Math.min(50, Math.max(0, Math.floor(Number(wallCount) || 0)))
                  })
                }
              >
                Create job sheet
              </Button>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export const JobSheetPage: FC = () => (
  <Suspense
    fallback={
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={40} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    }
  >
    <JobSheetContent />
  </Suspense>
);
