import { useUpdateTimesheetEntryMutation } from 'api/timesheet';
import { ProjectSelectRHF } from 'components/Forms/Selects/ProjectSelect';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import BasicModal from 'components/Modal';
import { FormBody } from 'layouts/FormLayout';
import { type FC } from 'react';
import { calculateTimeDifference } from 'utils/date';
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
              ...entry,
              deleted: true
            },
            {
              onSuccess: () => {
                onClose();
              }
            }
          );
        }}
        onSubmit={methods.handleSubmit((d) => {
          updateMutation.mutate(
            {
              ...d,
              duration: calculateTimeDifference(d.startTime, d.endTime).totalMinutes,
              id: entry.id
            },
            {
              onSuccess: () => {
                onClose();
              }
            }
          );
        })}
      >
        <TextFieldRHF type="time" name="startTime" {...methods} />
        <TextFieldRHF type="time" name="endTime" {...methods} />
        <ProjectSelectRHF {...methods} name="projectId" />
      </FormBody>
    </BasicModal>
  );
};
