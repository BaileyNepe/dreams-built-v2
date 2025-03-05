import { Navigate, Outlet } from '@tanstack/react-router';
import { Footer } from 'components/Footer';
import { Header } from 'components/Header';
import { type FC } from 'react';
import styled from 'styled-components';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
`;

export const LandingLayout: FC = () => {
  const { isAuthenticated, isLoading } = useAuthOptionalUser();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </Layout>
  );
};
