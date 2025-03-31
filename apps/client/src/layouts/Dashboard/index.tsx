import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { type FC, Suspense, useState } from 'react';
import { styled } from 'styled-components';

import { Outlet } from '@tanstack/react-router';
import Loader from 'components/Loader';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';
import { Header } from './Header';
import { NavBar } from './Navbar';
import { DRAWER_WIDTH, HEADER_HEIGHT } from './constants';

const Main = styled.main`
  flex-grow: 1;
  margin-top: ${HEADER_HEIGHT};
  @media (max-width: 1199px) {
    margin-left: 0;
  }

  padding: ${({ theme }) => theme.spacing(2)};
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

export const Dashboard: FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuthOptionalUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isLoading && !isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: '/dashboard' }
    });

    return <Loader />;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <Main>
        <Loader />
      </Main>
    );
  }

  return (
    <Container>
      {/* Sidebar */}
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : sidebarOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 0,
            backgroundColor: theme.palette.primary.main
          }
        }}
      >
        <NavBar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Header */}
      <Header openSidebar={handleDrawerToggle} />

      {/* Main Content */}
      <Main>
        <Suspense>{isAuthenticated && !isLoading ? <Outlet /> : <Loader />}</Suspense>
      </Main>
    </Container>
  );
};
