import { ToastProvider } from 'libs/Notify';
import { Suspense, type FC, type PropsWithChildren } from 'react';
import { AuthContext } from 'utils/contexts/AuthProvider';

export const AppProviders: FC<PropsWithChildren> = ({ children }) => (
  <AuthContext>
    <TRPCContext>
      <ThemeCustomization>
        <DefaultErrorBoundary>
          <ConfigProvider>
            <Suspense>
              <ToastProvider />
              {children}
            </Suspense>
          </ConfigProvider>
        </DefaultErrorBoundary>
      </ThemeCustomization>
    </TRPCContext>
  </AuthContext>
);
