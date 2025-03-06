import { clientSchema } from '@dreams-built/shared/src/schemas';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useCreateClientMutation } from 'api/clients';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { FormLayout } from 'layouts/FormLayout';
import { generateRandomColor } from 'utils/color';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';

const ClientsCreatePage = () => {
  const create = useCreateClientMutation();
  const navigate = useNavigate();

  const methods = useCustomForm({
    schema: clientSchema,
    defaultValues: {
      name: '',
      color: generateRandomColor()
    }
  });

  return (
    <FormLayout
      title="Create Client"
      onSubmit={methods.handleSubmit((data) => {
        create.mutate(data, {
          onSuccess: () => {
            navigate({ to: paths.clients });
          }
        });
      })}
    >
      <TextFieldRHF name="name" {...methods} />
      <TextFieldRHF name="color" {...methods} type="color" />
    </FormLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/clients/create')({
  component: ClientsCreatePage
});
