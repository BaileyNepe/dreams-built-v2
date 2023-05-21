import { api } from '@/utils/api';
import { type AppProps, type AppType } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';

import './bootstrap.min.css';

import DashboardLayout from '@/components/Layouts/Dashboard';
import StandardLayout from '@/components/Layouts/Standard';
import { store } from '@/components/store';
import { theme } from '@/components/theme';
import '@/styles/globals.css';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { type NextComponentType } from 'next';
import { type Router } from 'next/router';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';

const AppContent = ({ Component, pageProps, router }: AppProps) => {
  const { user } = useUser();
  const WrappedComponent = user ? (
    <DashboardLayout>
      <Component {...pageProps} router={router} />
    </DashboardLayout>
  ) : (
    <StandardLayout>
      <Component {...pageProps} />
    </StandardLayout>
  );

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ToastContainer theme='colored' />
        {WrappedComponent}
      </ThemeProvider>
    </Provider>
  );
};

const MyApp: AppType = ({
  Component,
  pageProps,
  router,
}: {
  Component: NextComponentType;
  pageProps: Record<string, unknown>;
  router: Router;
}) => (
  <UserProvider>
    <AppContent Component={Component} pageProps={pageProps} router={router} />
  </UserProvider>
);

export default api.withTRPC(MyApp);
