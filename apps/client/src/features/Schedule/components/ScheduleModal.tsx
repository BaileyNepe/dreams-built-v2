import { type FC } from 'react';

import {
  createScheduleSchema,
  updateScheduleSchema
} from '@dreams-built/shared/src/schemas';

import { useCreateScheduleMutation, useUpdateScheduleMutation } from 'api/schedule';
import { ProjectSelectRHF } from 'components/Forms/Selects/ProjectSelect';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import BasicModal from 'components/Modal';
import { FormBody } from 'layouts/FormLayout';
import { notify } from 'libs/Notify';
import { type DateTime } from 'luxon';
import styled from 'styled-components';
import { formatDate } from 'utils/date';
import { useCustomForm } from 'utils/hooks/useForm';
import { type Task } from './useSchedule';

const DateContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const CreateScheduleBody: FC<{
  range: { start: DateTime; end: DateTime };
  projectPartId: string;
  onClose: () => void;
}> = ({ range, onClose, projectPartId }) => {
  const create = useCreateScheduleMutation();
  const methods = useCustomForm({
    schema: createScheduleSchema,
    defaultValues: {
      startDate: formatDate({ date: range.start }),
      endDate: formatDate({ date: range.end }),
      projectPartId,
      notes: '',
      projectId: ''
    }
  });

  return (
    <FormBody
      isSubmitting={methods.formState.isSubmitting}
      onSubmit={methods.handleSubmit((d) => {
        create.mutate(
          {
            ...d,
            startDate: formatDate({ date: range.start }),
            endDate: formatDate({ date: range.end }),
            notes: d.notes || ''
          },
          {
            onSuccess: () => {
              notify('Created', { type: 'success' });
              onClose();
            }
          }
        );
      })}
    >
      <ProjectSelectRHF name="projectId" {...methods} />
      <DateContainer>
        <TextFieldRHF type="date" name="startDate" label="Start" {...methods} />
        <TextFieldRHF type="date" name="endDate" label="End" {...methods} />
      </DateContainer>
      <TextFieldRHF name="notes" label="Notes" {...methods} multiline minRows={4} />
    </FormBody>
  );
};

export const RangeSelectionModal: FC<{
  range: { start: DateTime; end: DateTime } | null;
  projectPartId: string;
  onClose: () => void;
}> = ({ range, onClose, projectPartId }) => {
  if (!range) return null;

  return (
    <BasicModal open={!!range} onClose={onClose} title="Create Schedule">
      <CreateScheduleBody
        projectPartId={projectPartId}
        range={range!}
        onClose={() => {
          onClose();
        }}
      />
    </BasicModal>
  );
};

export const EditScheduleModal: FC<{
  open: boolean;
  onClose: () => void;
  data: Task;
}> = ({ open, onClose, data }) => {
  const edit = useUpdateScheduleMutation();

  const methods = useCustomForm({
    schema: updateScheduleSchema,
    defaultValues: {
      id: data.id,
      startDate: formatDate({ date: data.startDate }),
      endDate: formatDate({ date: data.endDate }),
      notes: data.notes,
      color: data.project.color,
      deleted: false
    }
  });

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      title={`${data.project.jobNumber} : ${data.project.address}`}
    >
      <FormBody
        isSubmitting={edit.isPending || methods.formState.isSubmitting}
        onDelete={() => {
          edit.mutate(
            {
              id: data.id,
              deleted: true,
              startDate: formatDate({ date: data.startDate }),
              endDate: formatDate({ date: data.endDate }),
              color: data.project.color
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
          edit.mutate(
            {
              ...d,
              id: data.id
            },
            {
              onSuccess: () => {
                onClose();
              }
            }
          );
        })}
      >
        <DateContainer>
          <TextFieldRHF type="date" name="startDate" label="Start" {...methods} />
          <TextFieldRHF type="date" name="endDate" label="End" {...methods} />
        </DateContainer>
        <TextFieldRHF type="color" name="color" label="Project Colour" {...methods} />
        <TextFieldRHF name="notes" {...methods} multiline minRows={4} />
      </FormBody>
    </BasicModal>
  );
};
