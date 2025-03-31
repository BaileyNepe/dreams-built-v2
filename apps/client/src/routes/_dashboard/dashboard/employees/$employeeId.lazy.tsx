import { RoleSchema } from '@dreams-built/shared/src/auth/types';
import { updateUserSchema } from '@dreams-built/shared/src/schemas';
import { MenuItem, Skeleton, Stack } from '@mui/material';
import { createLazyFileRoute, useParams } from '@tanstack/react-router';
import { useUpdateUserMutation, useUser } from 'api/user';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { FormBody, FormLayout } from 'layouts/FormLayout';
import { Suspense } from 'react';
import { useCustomForm } from 'utils/hooks/useForm';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';

const EditUserForm = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams({
    from: '/_dashboard/dashboard/employees/$employeeId'
  });
  const user = useUser(employeeId);
  const update = useUpdateUserMutation(employeeId);

  const methods = useCustomForm({
    schema: updateUserSchema,
    defaultValues: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      hourlyRate: user.hourlyRate,
      role: user.role
    }
  });

  return (
    <FormBody
      isSubmitting={methods.formState.isSubmitting}
      onSubmit={methods.handleSubmit((d) => {
        update.mutate(
          { ...d, id: employeeId },
          {
            onSuccess: () => {
              navigate({ to: paths.employees });
            }
          }
        );
      })}
    >
      <TextFieldRHF name="firstName" {...methods} />
      <TextFieldRHF name="lastName" {...methods} />
      <TextFieldRHF
        name="hourlyRate"
        type="number"
        slotProps={{
          htmlInput: {
            min: 0,
            step: 0.01
          }
        }}
        {...methods}
      />
      <TextFieldRHF name="role" select {...methods} defaultValue={user.role}>
        {RoleSchema._def.values.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextFieldRHF>
    </FormBody>
  );
};

const RouteComponent = () => (
  <FormLayout title="Edit User">
    <Suspense
      fallback={
        <Stack spacing={2} sx={{ width: '100%' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} width="100%" />
          ))}
        </Stack>
      }
    >
      <EditUserForm />
    </Suspense>
  </FormLayout>
);

export const Route = createLazyFileRoute('/_dashboard/dashboard/employees/$employeeId')({
  component: RouteComponent
});
