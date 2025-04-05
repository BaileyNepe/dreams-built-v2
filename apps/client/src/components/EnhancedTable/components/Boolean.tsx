import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { type FC } from 'react';

export const Boolean: FC<{ value: boolean }> = ({ value }) =>
  value ? <DoneIcon color="success" /> : <CloseIcon color="error" />;
