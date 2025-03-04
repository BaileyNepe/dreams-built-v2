import SaveIcon from '@mui/icons-material/Save';
import { type FC } from 'react';
import { Button } from './Button';

export const SubmitButton: FC<{
  onClick?: () => void;
  isLoading: boolean;
}> = ({ onClick, isLoading = false }) => (
  <Button
    startIcon={<SaveIcon />}
    loading={isLoading}
    loadingIndicator="Saving…"
    type="submit"
    variant="contained"
    onClick={onClick}
    
  >
    Save
  </Button>
);
