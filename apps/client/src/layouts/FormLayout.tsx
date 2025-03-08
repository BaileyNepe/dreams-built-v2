import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { SubmitButton } from 'components/SubmitButton';
import { type FC } from 'react';
import styled from 'styled-components';

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
  padding: 1rem;
  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
  }
`;
const HeaderContainer = styled.div`
  display: grid;
  @media (min-width: 640px) {
    width: max-content;
  }
`;

const ButtonContainer = styled.div`
  button {
    width: 100%;
  }
  @media (min-width: 640px) {
    button {
      width: auto;
    }
  }
`;

export const FormBody: FC<{
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}> = ({ children, onSubmit }) => (
  <Form onSubmit={onSubmit}>
    <div>{children}</div>
    <ButtonContainer>
      <SubmitButton isLoading={false} />
    </ButtonContainer>
  </Form>
);

export const FormLayout: FC<{
  title: string;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}> = ({ title, onSubmit, children }) => {
  const router = useRouter();

  return (
    <Container>
      <HeaderContainer>
        <Button
          variant="text"
          startIcon={<ChevronLeftIcon />}
          onClick={() => router.history.back()}
        >
          Back
        </Button>
      </HeaderContainer>
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
        {onSubmit ? <FormBody onSubmit={onSubmit}>{children}</FormBody> : children}
      </FormContainer>
    </Container>
  );
};
