import { Typography } from '@mui/material';
import BasicModal from 'components/Modal';
import { type FC } from 'react';
import { type UsersWithNoEntries } from '../hooks/useUserReport';

export const MissingEntriesModal: FC<{
  open: boolean;
  users: UsersWithNoEntries;
  onClose: () => void;
}> = ({ open, onClose, users }) => (
  <BasicModal open={open} onClose={onClose} title="Users with No Entries">
    <div>
      {users.map((user) => (
        <Typography key={user.id} variant="body2">
          {`${user.firstName} ${user.lastName}`.trim()}
        </Typography>
      ))}
    </div>
  </BasicModal>
);
