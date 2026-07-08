import { authz } from '@dreams-built/shared/src/auth/permissions';
import { computeFloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
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
  Typography
} from '@mui/material';
import { useClient } from 'api/clients';
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
import { SectionItems } from './SectionItems';
import { SheetView } from './SheetView';
import { useJobSheetContext, JobSheetProvider } from './state/JobSheetProvider';
import { TallyPanel } from './TallyPanel';
import { WallTable } from './WallTable';

/** Everything inside the provider: toolbar, header, editor grid, print copy. */
const JobSheetEditor: FC = () => {
  const { projectId, data, rules, computed, dispatch, canEdit } = useJobSheetContext();
  const project = useProject(projectId);
  const client = useClient(project.clientId);
  const { printRef, handlePrint } = usePrint<HTMLDivElement>({
    isPrimaryContent: true
  });

  const outline = useMemo(
    () => computeFloorOutline(data, computed, rules),
    [data, computed, rules]
  );
  const [planInPrint, setPlanInPrint] = useState(false);

  return (
    <>
      <JobSheetToolbar onPrint={handlePrint} />
      <JobSheetHeader />
      <Divider sx={{ my: 2 }} />

      <WallTable />

      <Box sx={{ mt: 2 }}>
        <FloorPlanPanel
          outline={outline}
          includeInPrint={planInPrint}
          onIncludeInPrintChange={setPlanInPrint}
        />
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6} sm={3} md={2}>
          <TallyPanel section="shutters" />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TallyPanel section="rebate" />
        </Grid>
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

      {/* Hidden on screen; cloned into #print by usePrint. */}
      <PrintableContent ref={printRef} isHidden orientation="portrait">
        <SheetView
          headerText={`${client.name} - ${project.address}, ${project.city}`}
          jobNumber={project.jobNumber}
          data={data}
          rules={rules}
          computed={computed}
        />
        {planInPrint && outline.walls.length > 0 && (
          <div style={{ breakInside: 'avoid', paddingTop: '4mm' }}>
            <FloorPlanSvg outline={outline} />
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
  const canEdit = user.permissions?.includes(authz.jobs_edit) || false;

  const sheet = useJobSheet(projectId);
  const createSheet = useCreateJobSheetMutation();

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
            <Button
              variant="contained"
              disabled={createSheet.isPending}
              onClick={() => createSheet.mutate({ projectId })}
            >
              Create job sheet
            </Button>
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
