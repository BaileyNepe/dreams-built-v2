import { projectSchema } from '@dreams-built/shared/src/schemas';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCreateProjectMutation, useNextJobNumberQuery } from 'api/projects';
import { api } from 'api/trpc';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { FormLayout } from 'layouts/FormLayout';
import { generateRandomColor } from 'utils/color';
import { useCustomForm } from 'utils/hooks/useForm';
import { z } from 'zod';

const Page = () => {
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
    <FormLayout
      title="Create Project"
      onSubmit={methods.handleSubmit((data) => {
        create.mutate(data, {
          onSuccess: () => {
            utils.projects.nextJobNumber.invalidate();
            methods.reset();
            // make jobNumber auto increment
          }
        });
      })}
    >
      <TextFieldRHF name="address" {...methods} />
      <TextFieldRHF name="area" {...methods} type="number" />
      <TextFieldRHF name="city" {...methods} />
      <TextFieldRHF name="clientId" {...methods} />
      <TextFieldRHF name="endClient" {...methods} />
      <TextFieldRHF name="jobNumber" {...methods} type="number" />

      <TextFieldRHF name="color" {...methods} type="color" />
    </FormLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/projects/create')({
  component: Page
});
