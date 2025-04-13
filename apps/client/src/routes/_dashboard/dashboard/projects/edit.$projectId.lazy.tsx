import { authz } from '@dreams-built/shared/src/auth/permissions';
import { projectSchema } from '@dreams-built/shared/src/schemas';
import { ChevronLeft } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useProject, useUpdateProjectMutation } from 'api/projects';
import { ProjectFormFields } from 'features/Projects/FormLayout';
import { ProjectFileList } from 'features/Projects/ProjectFileList';
import { FormBody } from 'layouts/FormLayout';
import { type FC, Suspense, useState } from 'react';
import { useAuth } from 'utils/contexts/AuthProvider';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useProjectParams } from './edit.$projectId';

const EditProjectForm: FC = () => {
  const { projectId } = useProjectParams();
  const project = useProject(projectId);
  const navigate = useNavigate();

  const update = useUpdateProjectMutation({ projectId });

  const methods = useCustomForm({
    schema: projectSchema,
    defaultValues: {
      address: project.address,
      area: project.area,
      city: project.city,
      clientId: project.clientId,
      endClient: project.endClient,
      jobNumber: project.jobNumber,
      color: project.color
    }
  });

  return (
    <FormBody
      isSubmitting={methods.formState.isSubmitting || update.isPending}
      onSubmit={methods.handleSubmit((data) => {
        update.mutate(
          { ...data, projectId },
          {
            onSuccess: () => {
              navigate({ to: paths.projects });
            }
          }
        );
      })}
    >
      <ProjectFormFields methods={methods} />
    </FormBody>
  );
};

const ProjectFile: FC = () => {
  const { projectId } = useProjectParams();
  const project = useProject(projectId);
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Project Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Job Number
              </Typography>
              <Typography variant="body1">{project.jobNumber}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                End Client
              </Typography>
              <Typography variant="body1">{project.endClient}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1">{project.address}</Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                City
              </Typography>
              <Typography variant="body1">{project.city}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Area
              </Typography>
              <Typography variant="body1">{project.area}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Invoice Status
              </Typography>
              <Typography variant="body1">
                {project.isInvoiced ? 'Invoiced' : 'Not Invoiced'}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

const ProjectDetailContent = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useAuth();
  const canEdit = user.permissions?.includes(authz.jobs_edit) || false;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          startIcon={<ChevronLeft />}
          onClick={() => navigate({ to: paths.projects })}
        >
          Back to Projects
        </Button>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={isEditing ? <VisibilityIcon /> : <EditIcon />}
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? 'View Project' : 'Edit Project'}
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>
        Project Details
      </Typography>

      <Suspense
        fallback={
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" height={50} />
            <Skeleton variant="rectangular" height={50} />
            <Skeleton variant="rectangular" height={50} />
          </Stack>
        }
      >
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>{isEditing ? <EditProjectForm /> : <ProjectFile />}</CardContent>
        </Card>
      </Suspense>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>
        Project Files
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
          <ProjectFileList />
        </Suspense>
      </Box>
    </>
  );
};

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/edit/$projectId'
)({
  component: ProjectDetailContent
});
