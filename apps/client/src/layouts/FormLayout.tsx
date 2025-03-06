import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { SubmitButton } from 'components/SubmitButton';
import { type FC } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: ${({ theme }) => theme.customShadows.outline};
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
  max-width: 600px;
  padding: 1rem;
  width: 100%;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  @media (min-width: 640px) {
    padding: 1rem 1.5rem;
  }
`;
const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
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

export const FormLayout: FC<{
  children: React.ReactNode;
  title: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}> = ({ children, title, onSubmit }) => {
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

      <Form onSubmit={onSubmit}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={600}
          color="text.primary"
          align="center"
        >
          {title}
        </Typography>
        <div>{children}</div>
        <ButtonContainer>
          <SubmitButton isLoading={false} />
        </ButtonContainer>
      </Form>
    </Container>
  );
};
