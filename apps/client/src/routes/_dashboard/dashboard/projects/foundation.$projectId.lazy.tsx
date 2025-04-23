import { ChevronLeft } from '@mui/icons-material';
import { Box, Button, Divider, Skeleton, Typography } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useProject } from 'api/projects';
import { FoundationCalculator } from 'features/Projects/FoundationCalculator';
import { type FC, Suspense } from 'react';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useParams } from './foundation.$projectId';

const FoundationCalculatorContent: FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const project = useProject(projectId);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<ChevronLeft />}
          onClick={() => navigate({ to: paths.projectsEdit, params: { projectId } })}
        >
          Back to Project
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>
        Foundation Calculator: {project.jobNumber} - {project.address}
      </Typography>

      <Suspense fallback={<Skeleton variant="rectangular" height={600} />}>
        <FoundationCalculator />
      </Suspense>
    </>
  );
};

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/foundation/$projectId'
)({
  component: FoundationCalculatorContent
});
