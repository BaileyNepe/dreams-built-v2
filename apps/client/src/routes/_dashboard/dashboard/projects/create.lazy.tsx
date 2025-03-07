import { projectSchema } from '@dreams-built/shared/src/schemas';
import { Skeleton, Stack } from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCreateProjectMutation, useNextJobNumberQuery } from 'api/projects';
import { api } from 'api/trpc';
import { ClientSelectRHF } from 'components/Forms/Selects/ClientSelect';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { FormBody, FormLayout } from 'layouts/FormLayout';
import { type FC, Suspense } from 'react';
import styled from 'styled-components';
import { generateRandomColor } from 'utils/color';
import { useCustomForm } from 'utils/hooks/useForm';

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;

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
      clientId: '',
      endClient: '',
      jobNumber: nextJobNumber,
      color: generateRandomColor()
    }
  });

  return (
    <FormBody
      onSubmit={methods.handleSubmit((data) => {
        create.mutate(
          { ...data, jobNumber: Number(data.jobNumber), area: Number(data.area) },
          {
            onSuccess: async () => {
              await utils.projects.nextJobNumber.invalidate();
              methods.reset({
                address: '',
                area: 0,
                city: '',
                clientId: '',
                endClient: '',
                jobNumber: nextJobNumber + 1,
                color: generateRandomColor()
              });
            }
          }
        );
      })}
    >
      <Grid>
        <TextFieldRHF className="address" name="address" {...methods} />

        <TextFieldRHF className="area" name="area" {...methods} type="number" />

        <TextFieldRHF className="city" name="city" {...methods} />

        <ClientSelectRHF className="clientId" name="clientId" {...methods} />

        <TextFieldRHF className="endClient" name="endClient" {...methods} />

        <TextFieldRHF className="jobNumber" name="jobNumber" {...methods} type="number" />

        <TextFieldRHF className="color" name="color" {...methods} type="color" />
      </Grid>
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
