import { createFileRoute } from '@tanstack/react-router';
import Loader from 'components/Loader';
import { useEffect } from 'react';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';

function RouteComponent() {
  const { isLoading, isAuthenticated, logout } = useAuthOptionalUser();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        logout();
      } else {
        window.location.href = '/';
      }
    }
  }, [isLoading, logout, isAuthenticated]);

  return <Loader />;
}

export const Route = createFileRoute('/logout')({
  component: RouteComponent
});
