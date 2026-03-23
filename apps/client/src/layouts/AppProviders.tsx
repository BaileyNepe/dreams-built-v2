import { HeadContent, Outlet } from '@tanstack/react-router';
import { DefaultErrorBoundary } from 'components/ErrorBoundary/DefaultErrorScreen';
import { ToastProvider } from 'libs/Notify';
import { Suspense, type FC } from 'react';
import ThemeCustomization from 'themes';
import { AuthContext } from 'utils/contexts/AuthProvider';
import { TRPCContext } from 'utils/contexts/TrpcContext';

export const AppProviders: FC = () => (
  <AuthContext>
    <TRPCContext>
      <ThemeCustomization>
        <DefaultErrorBoundary>
          <HeadContent />
          <Suspense>
            <ToastProvider />
            <Outlet />
          </Suspense>
        </DefaultErrorBoundary>
      </ThemeCustomization>
    </TRPCContext>
  </AuthContext>
);
