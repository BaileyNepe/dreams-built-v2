import { projectSchema } from '@dreams-built/shared/src/schemas';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useProject, useUpdateProjectMutation } from 'api/projects';
import { ProjectFormFields } from 'features/Projects/FormLayout';
import { FormLayout } from 'layouts/FormLayout';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useProjectParams } from './edit.$projectId';

const RouteComponent = () => {
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
    <FormLayout
      title="Edit Project"
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
    </FormLayout>
  );
};

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/edit/$projectId'
)({
  component: RouteComponent
});
