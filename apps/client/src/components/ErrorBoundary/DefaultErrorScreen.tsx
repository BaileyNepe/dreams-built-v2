import { Box, Typography } from '@mui/material';
// import errorImage from 'assets/images/errors/error-404.png';

import { Button } from 'components/Button';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type PropsWithChildren
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useAuthInit } from 'utils/contexts/AuthProvider';
import ErrorBoundary from '.';

const ErrorScreenContainer = styled.div<{ $isMultiline: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  justify-content: center;
  margin: auto;

  text-align: center;
  width: 100dvw;
`;

const ErrorScreenContent = styled.div`
  background-color: ${(p) => p.theme.palette.background.paper};
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: ${(p) => p.theme.shape.borderRadius * 3}px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  color: ${(p) => p.theme.palette.text.primary};
  font-size: 1.8rem;

  opacity: 1;
  padding: 2rem;
  text-align: center;

  h1 {
    color: ${(p) => p.theme.palette.secondary.main};

    font-weight: bold;
    margin-bottom: 2rem;
  }

  p {
    color: ${(p) => p.theme.palette.text.secondary};
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  img {
    align-self: center;
    height: 10rem;
    justify-self: center;
    margin: 0 auto 2rem;
    width: auto;
  }
`;

const ErrorLinksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
`;

export const DefaultErrorScreen: FC<{
  error?: {
    name?: string;
    message?: string;
  };
  onResetError?: () => void;
}> = ({ onResetError, error }) => {
  const theme = useTheme();
  const { logout } = useAuthInit();
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Refresh the browser if the user gets an error message to say they are offline,
   * but then goes back online.
   */
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isChunkLoadError = error?.name === 'ChunkLoadError';

  useEffect(() => {
    if (isChunkLoadError) {
      window.location.reload();
    }
  }, [isChunkLoadError]);

  return (
    <Box
      sx={{
        // ...bgGradient({
        //   color: alpha(theme.palette.background.default, 0.5),
        //   imgUrl: '/assets/background/overlay_1.webp'
        // }),
        overflow: 'hidden'
      }}
    >
      <ErrorScreenContainer
        ref={containerRef}
        data-testid="content-container"
        $isMultiline={(error?.message?.length || 0) > 50}
      >
        <ErrorScreenContent>
          {/* <img src={errorImage} alt="Error" /> */}
          <Typography variant="h1">Oops!</Typography>
          <p data-testid="error-message">{error?.message}</p>

          <p>This is not supposed to happen. Please try again later.</p>

          <ErrorLinksContainer>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                onResetError?.();
                window.history.pushState({}, '', '/');
                window.location.reload();
              }}
            >
              Back Home
            </Button>

            <Button variant="outlined" color="secondary" onClick={async () => logout()}>
              Log out
            </Button>
          </ErrorLinksContainer>
        </ErrorScreenContent>
      </ErrorScreenContainer>
    </Box>
  );
};

const UnhandledErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuthInit();
  const [error, setError] = useState<{
    name: string;
    message: string;
  } | null>(null);

  const promiseRejectionHandler = useCallback((event: PromiseRejectionEvent) => {
    setError(event.reason);
  }, []);

  const handleResetError = useCallback(async () => {
    setError(null);
    window.history.pushState({}, '', window.location.pathname);
    if (auth.isAuthenticated) {
      await auth.logout();
    }
  }, [auth]);

  useEffect(() => {
    window.addEventListener('unhandledrejection', promiseRejectionHandler);

    return () => {
      window.removeEventListener('unhandledrejection', promiseRejectionHandler);
    };
  }, [promiseRejectionHandler]);

  return error ? (
    <DefaultErrorScreen error={error} onResetError={handleResetError} />
  ) : (
    <>{children}</>
  );
};

export const DefaultErrorBoundary: FC<PropsWithChildren> = ({ children }) => (
  <UnhandledErrorBoundary>
    <ErrorBoundary
      fallback={(error, handleResetError) => (
        <DefaultErrorScreen onResetError={handleResetError} error={error} />
      )}
    >
      {children}
    </ErrorBoundary>
  </UnhandledErrorBoundary>
);
