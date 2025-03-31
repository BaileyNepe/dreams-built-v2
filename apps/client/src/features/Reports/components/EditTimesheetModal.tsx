import { useUpdateTimesheetEntryMutation } from 'api/timesheet';
import BasicModal from 'components/Modal';
import { FormBody } from 'layouts/FormLayout';
import { notify } from 'libs/Notify';
import { type FC } from 'react';
import { useCustomForm } from 'utils/hooks/useForm';
import { type Entry } from '../hooks/useUserReport';

export const EditTimesheetEntryModal: FC<{
  open: boolean;
  onClose: () => void;
  entry: Entry;
}> = ({ open, onClose, entry }) => {
  const updateMutation = useUpdateTimesheetEntryMutation();
  const methods = useCustomForm({
    defaultValues: {
      id: entry.id,
      userId: entry.userId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      projectId: entry.projectId
    }
  });

  return (
    <BasicModal open={open} onClose={onClose} title="Edit Timesheet Entry">
      <FormBody
        isSubmitting={updateMutation.isPending || methods.formState.isSubmitting}
        onDelete={() => {
          updateMutation.mutate(
            {
              ...methods.getValues(),
              deleted: true
            },
            {
              onSuccess: () => {
                notify('Deleted', { type: 'success' });
                onClose();
              }
            }
          );
        }}
        onSubmit={methods.handleSubmit((d) => {
          updateMutation.mutate(d, {
            onSuccess: () => {
              notify('Updated', { type: 'success' });
              onClose();
            }
          });
        })}
      >
        {/* Form Fields Here */}
        <div></div>
      </FormBody>
    </BasicModal>
  );
};
