import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { ConfirmationDialog } from 'components/ConfirmationDialog';
import { SubmitButton } from 'components/SubmitButton';
import { type FC, useState } from 'react';
import styled from 'styled-components';
import { useResponsive } from 'utils/hooks/useResponsive';

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  display: grid;

  gap: 1rem;
  margin: 0 auto;
  max-width: 600px;
  padding: 1rem;
  width: 100%;
`;

const Form = styled.form`
  display: grid;
  gap: 2rem;
  width: 100%;
`;
const Container = styled.div`
  display: grid;
  gap: 1rem;
  padding-bottom: 1rem;
  @media (min-width: 640px) {
    padding: 0rem 1.5rem 1.5rem;
  }
`;
const HeaderContainer = styled.div`
  display: grid;
  @media (min-width: 640px) {
    width: max-content;
  }
`;

const ButtonContainer = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 640px) {
    display: flex;
    justify-content: space-between;
  }
`;

export const FormBody: FC<{
  children: React.ReactNode;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
}> = ({ children, onSubmit, onDelete, isSubmitting, buttonIcon, buttonText }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleOpenDeleteDialog = () => {
    setConfirmDelete(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDelete(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setConfirmDelete(false);
  };

  return (
    <Form onSubmit={onSubmit}>
      <div>{children}</div>
      <ButtonContainer>
        <SubmitButton isLoading={isSubmitting} text={buttonText} icon={buttonIcon} />
        {!!onDelete && (
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleOpenDeleteDialog}
          >
            Delete
          </Button>
        )}
      </ButtonContainer>

      <ConfirmationDialog
        open={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
        confirmText="Delete"
        severity="error"
      />
    </Form>
  );
};

export const FormLayout: FC<{
  title: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}> = ({ title, onSubmit, children, isSubmitting = false }) => {
  const router = useRouter();
  const isLargeScreen = useResponsive('up', 'sm');

  return (
    <Container>
      {isLargeScreen && (
        <HeaderContainer>
          <Button
            variant="text"
            startIcon={<ChevronLeftIcon />}
            onClick={() => router.history.back()}
          >
            Back
          </Button>
        </HeaderContainer>
      )}
      <FormContainer>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={600}
          color="text.primary"
          align="center"
        >
          {title}
        </Typography>
        {onSubmit ? (
          <FormBody onSubmit={onSubmit} isSubmitting={isSubmitting}>
            {children}
          </FormBody>
        ) : (
          children
        )}
      </FormContainer>
    </Container>
  );
};
