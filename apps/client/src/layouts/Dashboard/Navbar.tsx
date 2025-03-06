import Box from '@mui/material/Box';

import { useLocation } from '@tanstack/react-router';
import { RouterLink } from 'components/Link';
import { Logo } from 'components/Logo';
import { type FC } from 'react';
import { styled } from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { routes } from './routes'; // Your route definitions for TanStack Router

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HeaderBox = styled(Box)`
  align-items: center;
  display: flex;
  height: 64px;
  padding: 0 ${({ theme }) => theme.spacing(3)};
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  list-style-type: none;
  margin: 1rem 0;
  padding: 0.2rem 0.5rem;
`;

const Button = styled.div<{ $isActive: boolean }>`
  align-items: center;
  background-color: ${({ theme, $isActive: isActive }) =>
    isActive ? theme.palette.primary.light : 'transparent'};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  margin: 0 0.5rem;
  padding: 0.25rem 1rem;
  text-align: center;

  transition: all 0.1s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.light};
  }
`;

const ListItemIcon = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.palette.grey[500]};
  display: flex;
  justify-content: center;

  svg {
    height: 1.5rem;
  }
`;

const ButtonText = styled.span`
  color: ${({ theme }) => theme.palette.grey[300]};
  text-transform: capitalize;
`;

export const NavBar: FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const filteredRoutes = routes.filter((route) => {
    if (route.requiredPermission) {
      return user.permissions?.includes(route.requiredPermission);
    }
    return true;
  });

  return (
    <Container>
      <HeaderBox>
        <Logo />
      </HeaderBox>
      <Box flex="1" overflow="auto">
        <List>
          {filteredRoutes.map((item) => {
            const active = pathname === item.to;
            return (
              <RouterLink key={item.name} to={item.to}>
                <Button $isActive={active}>
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ButtonText>{item.name}</ButtonText>
                </Button>
              </RouterLink>
            );
          })}
        </List>
      </Box>
    </Container>
  );
};
