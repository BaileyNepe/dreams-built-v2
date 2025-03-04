import { TextField } from '@mui/material';
import BasicModal from 'components/Modal';
import { type FC } from 'react';
import { useTimesheet } from '../hooks/useTimesheet';

export const CommentModal: FC<{ isOpen: boolean; onClose: () => void; day: string }> = ({
  isOpen,
  onClose,
  day
}) => {
  const { notes, updateComment } = useTimesheet();
  const currentNote = notes.find((note) => note.day === day);
  const message = currentNote?.message || '';

  return (
    <BasicModal open={isOpen} onClose={onClose} title={`Note for ${day}`}>
      <TextField
        fullWidth
        multiline
        maxRows={6}
        minRows={4}
        value={message}
        onChange={(e) => updateComment({ day, message: e.target.value })}
        slotProps={{ htmlInput: { maxLength: 1000 } }}
        helperText={`${message.length}/1000`}
        variant="outlined"
      />
    </BasicModal>
  );
};
