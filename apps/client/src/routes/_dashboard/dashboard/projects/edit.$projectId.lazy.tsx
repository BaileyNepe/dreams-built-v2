import { projectSchema } from '@dreams-built/shared/src/schemas';
import { Skeleton, Stack } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useProject, useUpdateProjectMutation } from 'api/projects';
import { ProjectFormFields } from 'features/Projects/FormLayout';
import { FormBody, FormLayout } from 'layouts/FormLayout';
import { Suspense } from 'react';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useProjectParams } from './edit.$projectId';

const EditProjectForm = () => {
  const { projectId } = useProjectParams();
  const project = useProject(projectId);

  const update = useUpdateProjectMutation({ projectId });

  const navigate = useNavigate();

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

const RouteComponent = () => (
  <FormLayout title="Edit Project">
    <Suspense
      fallback={
        <Stack spacing={2} sx={{ width: '100%' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} width="100%" />
          ))}
        </Stack>
      }
    >
      <EditProjectForm />
    </Suspense>
  </FormLayout>
);

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/edit/$projectId'
)({
  component: RouteComponent
});
