import { authz } from '@dreams-built/shared/src/auth/permissions';
import { projectSchema } from '@dreams-built/shared/src/schemas';
import { ChevronLeft } from '@mui/icons-material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useProject, useUpdateProjectMutation } from 'api/projects';
import {
  useLinkProjectMutation,
  usePushProjectMutation,
  useUnlinkProjectMutation,
  useXeroProjects,
  useXeroStatus
} from 'api/xero';
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
      color: project.color,
      deleted: project.deleted
    }
  });

  return (
    <FormBody
      onDelete={() => {
        update.mutate(
          { ...methods.getValues(), projectId, deleted: true },
          {
            onSuccess: () => {
              navigate({ to: paths.projects });
            }
          }
        );
      }}
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

const XeroPanel: FC = () => {
  const { projectId } = useProjectParams();
  const project = useProject(projectId);
  const status = useXeroStatus();

  const isConnected = status.data?.status === 'CONNECTED';
  const isLinked = Boolean(project.xeroProjectId);

  const xeroProjects = useXeroProjects(undefined, isConnected && !isLinked);
  const link = useLinkProjectMutation();
  const unlink = useUnlinkProjectMutation();
  const push = usePushProjectMutation();

  if (!status.data || status.data.status === 'DISCONNECTED') {
    return null;
  }

  if (status.data.status === 'ERROR') {
    return (
      <Alert severity="warning">
        The Xero connection has expired — project syncing is paused until an admin
        reconnects it in Settings → Xero.
      </Alert>
    );
  }

  if (isLinked) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Linked to Xero" color="success" size="small" />
          {project.xeroSyncedAt && (
            <Typography variant="body2" color="text.secondary">
              Last synced {new Date(project.xeroSyncedAt).toLocaleString()}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={push.isPending}
            onClick={() => push.mutate({ projectId })}
          >
            Sync now
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={unlink.isPending}
            onClick={() => unlink.mutate({ projectId })}
          >
            Unlink
          </Button>
        </Stack>
      </Stack>
    );
  }

  const options = (xeroProjects.data?.projects ?? []).filter(
    (xeroProject) => !xeroProject.linkedProjectId
  );

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        This job is not linked to a Xero project. Push it to create one, or link an
        existing Xero project.
      </Typography>
      {xeroProjects.error && <Alert severity="warning">{xeroProjects.error.message}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <Button
          variant="contained"
          size="small"
          disabled={push.isPending}
          onClick={() => push.mutate({ projectId })}
        >
          Create in Xero
        </Button>
        <Typography variant="body2" color="text.secondary">
          or
        </Typography>
        <Autocomplete
          size="small"
          sx={{ minWidth: 280 }}
          options={options}
          loading={xeroProjects.isLoading}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) =>
            option.xeroProjectId === value.xeroProjectId
          }
          onChange={(_event, value) => {
            if (value) {
              link.mutate({ projectId, xeroProjectId: value.xeroProjectId });
            }
          }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Link existing Xero project…" />
          )}
        />
      </Stack>
    </Stack>
  );
};

const ProjectDetailContent = () => {
  const navigate = useNavigate();
  const { projectId } = useProjectParams();
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={() =>
              navigate({ to: paths.projectJobSheet, params: { projectId } })
            }
          >
            Job Sheet
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

      {canEdit && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" sx={{ mb: 3 }}>
            Xero
          </Typography>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Suspense fallback={<Skeleton variant="rectangular" height={60} />}>
                <XeroPanel />
              </Suspense>
            </CardContent>
          </Card>
        </>
      )}

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
