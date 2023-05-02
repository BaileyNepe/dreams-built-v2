import { env } from '@/env.mjs';
import { api } from '@/utils/api';
import { AppProps, type AppType } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';

import './bootstrap.min.css';

import DashboardLayout from '@/components/Layouts/Dashboard';
import StandardLayout from '@/components/Layouts/Standard';
import { store } from '@/components/store';
import { theme } from '@/components/theme';
import '@/styles/globals.css';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';

const MyApp: AppType = ({ Component, pageProps, router }) => {
  return (
    <UserProvider>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </UserProvider>
  );
};

const AppContent = ({ Component, pageProps }: AppProps) => {
  const { user } = useUser();
  const WrappedComponent = user ? (
    <DashboardLayout>
      <Component {...pageProps} user={user} />
    </DashboardLayout>
  ) : (
    <StandardLayout>
      <Component {...pageProps} />
    </StandardLayout>
  );

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ToastContainer theme="colored" />
        {WrappedComponent}
      </ThemeProvider>
    </Provider>
  );
};

export default api.withTRPC(MyApp);
