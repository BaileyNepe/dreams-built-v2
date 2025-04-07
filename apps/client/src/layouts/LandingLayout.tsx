import { Navigate, Outlet } from '@tanstack/react-router';
import { Footer } from 'components/Footer';
import { Header } from 'components/Header';
import { type FC } from 'react';
import styled from 'styled-components';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';
import { useIsCoverPage } from 'utils/hooks/useIsCoverPage';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main<{ $hasPadding?: boolean }>`
  flex: 1;
  padding-top: ${({ $hasPadding }) => ($hasPadding ? '5.1rem' : '0')};
`;

export const LandingLayout: FC = () => {
  const { isAuthenticated, isLoading } = useAuthOptionalUser();
  const isCoverPage = useIsCoverPage();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <Header />
      <Main $hasPadding={!isCoverPage}>
        <Outlet />
      </Main>
      <Footer />
    </Layout>
  );
};
