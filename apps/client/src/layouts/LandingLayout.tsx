import { Outlet, useNavigate } from '@tanstack/react-router';
import { Footer } from 'components/Footer';
import { Header } from 'components/Header';
import { useEffect, type FC } from 'react';
import styled from 'styled-components';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';

const Layout = styled.div`
  display: grid;
  min-height: 100vh;
`;

const Main = styled.main<{ $hasPadding?: boolean }>`
  flex: 1;
  padding-top: 0;
`;

export const LandingLayout: FC = () => {
  const { isAuthenticated, isLoading } = useAuthOptionalUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

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
