import PlusIcon from '@mui/icons-material/Add';
import { Button, Typography } from '@mui/material';
import { Link, type LinkProps } from '@tanstack/react-router';
import { type FC, type PropsWithChildren } from 'react';
import { styled } from 'styled-components';

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

  @media (min-width: 640px) {
    /* sm breakpoint */
    flex-direction: row;
    align-items: center;
  }
`;

const TextContainer = styled.div`
  flex: 1;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;

  @media (min-width: 640px) {
    margin-left: 4rem;
    margin-top: 0;
    flex-shrink: 0;
  }
`;

const PageLayout: FC<
  PropsWithChildren & {
    title: string;
    to?: LinkProps['to'];
    description?: string;
  }
> = ({ children, title, to, description }) => (
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
      {to && (
        <ButtonContainer>
          <Link to={to} preload="intent">
            <Button variant="contained" startIcon={<PlusIcon />}>
              Add
            </Button>
          </Link>
        </ButtonContainer>
      )}
    </HeaderContainer>
    <div>{children}</div>
  </Container>
);

export default PageLayout;
