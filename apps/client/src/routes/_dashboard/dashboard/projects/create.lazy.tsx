import { projectSchema } from '@dreams-built/shared/src/schemas';
import { Skeleton, Stack } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCreateProjectMutation, useNextJobNumberQuery } from 'api/projects';
import { api } from 'api/trpc';
import { ProjectFormFields } from 'features/Projects/FormLayout';
import { FormBody, FormLayout } from 'layouts/FormLayout';
import { type FC, Suspense } from 'react';
import { generateRandomColor } from 'utils/color';
import { useCustomForm } from 'utils/hooks/useForm';

const ProjectCreationForm: FC = () => {
  const create = useCreateProjectMutation();
  const nextJobNumber = useNextJobNumberQuery();
  const utils = api.useUtils();

  const methods = useCustomForm({
    schema: projectSchema,
    defaultValues: {
      address: '',
      area: 0,
      city: '',
      clientId: undefined,
      endClient: '',
      jobNumber: nextJobNumber,
      color: generateRandomColor()
    }
  });

  return (
    <FormBody
      onSubmit={methods.handleSubmit((data) => {
        create.mutate(data, {
          onSuccess: async () => {
            await utils.projects.nextJobNumber.invalidate();
            methods.reset({
              address: '',
              area: 0,
              city: '',
              clientId: undefined,
              endClient: '',
              jobNumber: nextJobNumber + 1,
              color: generateRandomColor()
            });
          }
        });
      })}
    >
      <ProjectFormFields methods={methods} />
    </FormBody>
  );
};

const Page = () => (
  <FormLayout title="Create Project">
    <Suspense
      fallback={
        <Stack spacing={2} sx={{ width: '100%' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} width="100%" />
          ))}
        </Stack>
      }
    >
      <ProjectCreationForm />
    </Suspense>
  </FormLayout>
);

export const Route = createLazyFileRoute('/_dashboard/dashboard/projects/create')({
  component: Page
});
