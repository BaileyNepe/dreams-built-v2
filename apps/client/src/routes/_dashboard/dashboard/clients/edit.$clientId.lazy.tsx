import { clientSchema } from '@dreams-built/shared/src/schemas';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useClient, useUpdateClientMutation } from 'api/clients';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { FormLayout } from 'layouts/FormLayout';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { useClientParams } from './edit.$clientId';

const ClientsEditPage = () => {
  const { clientId } = useClientParams();
  const client = useClient(clientId);
  const update = useUpdateClientMutation({ clientId });

  const navigate = useNavigate();

  const methods = useCustomForm({
    schema: clientSchema,
    defaultValues: {
      name: client.name,
      color: client.color
    }
  });

  return (
    <FormLayout
      title="Edit Client"
      onSubmit={methods.handleSubmit((data) => {
        update.mutate(
          { ...data, id: clientId },
          {
            onSuccess: () => {
              navigate({ to: paths.clients });
            }
          }
        );
      })}
    >
      <TextFieldRHF name="name" {...methods} />
      <TextFieldRHF name="color" {...methods} type="color" />
    </FormLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/clients/edit/$clientId')({
  component: ClientsEditPage
});
