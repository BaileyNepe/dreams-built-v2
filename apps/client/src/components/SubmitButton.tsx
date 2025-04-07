import SaveIcon from '@mui/icons-material/Save';
import { type FC } from 'react';
import { Button } from './Button';

export const SubmitButton: FC<{
  onClick?: () => void;
  isLoading: boolean;
  text?: string;
  icon?: React.ReactNode;
}> = ({ onClick, isLoading = false, text = 'Save', icon }) => (
  <Button
    startIcon={icon ?? <SaveIcon />}
    loading={isLoading}
    type="submit"
    variant="contained"
    onClick={onClick}
  >
    {text}
  </Button>
);
