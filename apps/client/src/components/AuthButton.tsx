import { type FC } from 'react';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';
import { Button } from './Button';

export const AuthButton: FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, isLoading } = useAuthOptionalUser();

  const text = isAuthenticated ? 'Sign Out' : 'Sign In';

  return (
    <Button
      variant="text"
      color="inherit"
      onClick={(e) => {
        e.preventDefault();
        if (isAuthenticated) {
          logout();
        } else {
          loginWithRedirect({
            appState: { returnTo: window.location.pathname }
          });
        }
      }}
      disabled={isLoading}
    >
      {text}
    </Button>
  );
};
