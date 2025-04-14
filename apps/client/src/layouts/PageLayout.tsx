import PlusIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { Link, type LinkProps } from '@tanstack/react-router';
import { type FC, type PropsWithChildren, type ReactNode } from 'react';
import { styled } from 'styled-components';

const Container = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0.2rem;

  @media (min-width: 640px) {
    padding: 0 1rem;
    /* sm breakpoint */
    flex-direction: row;
    align-items: center;
  }
`;

const TextContainer = styled.div`
  flex: 1;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  button {
    width: 100%;
  }

  @media (min-width: 640px) {
    margin-left: 4rem;
    margin-top: 0;
    flex-shrink: 0;

    button {
      width: auto;
    }
  }
`;

const Main = styled.div`
  overflow-x: auto;
  padding: 0.2rem;

  @media (min-width: 640px) {
    padding: 1rem;
  }
`;

const PageLayout: FC<
  PropsWithChildren & {
    title: string;
    to?: LinkProps['to'];
    description?: string;
    actionButton?: ReactNode;
  }
> = ({ children, title, to, description, actionButton }) => (
  <Container>
    <HeaderContainer>
      <TextContainer>
        <Typography variant="h3" component="h1" fontWeight={500} color="text.primary">
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}
      </TextContainer>
      {(to || actionButton) && (
        <ButtonContainer>
          {actionButton}
          {to && (
            <Link to={to} preload="intent">
              <Button variant="contained" startIcon={<PlusIcon />}>
                Add
              </Button>
            </Link>
          )}
        </ButtonContainer>
      )}
    </HeaderContainer>
    <Main>{children}</Main>
  </Container>
);

export default PageLayout;
