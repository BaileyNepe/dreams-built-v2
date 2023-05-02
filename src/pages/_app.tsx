import { env } from '@/env.mjs';
import { api } from '@/utils/api';
import { type AppType } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';

import './bootstrap.min.css';

import DashboardLayout from '@/components/Layouts/Dashboard';
import StandardLayout from '@/components/Layouts/Standard';
import { store } from '@/components/store';
import { theme } from '@/components/theme';
import Loader from '@/components/ui/atoms/Loader';
import { paths } from '@/components/utils/paths';
import '@/styles/globals.css';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';

const MyApp: AppType = ({ Component, pageProps }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  const WrappedComponent = isAuthenticated ? (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  ) : (
    <StandardLayout>
      <Component {...pageProps} />
    </StandardLayout>
  );

  return (
    <Auth0Provider
      domain={env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        redirect_uri: paths.home,
      }}
    >
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ToastContainer theme="colored" />
          {isLoading ? <Loader /> : WrappedComponent}
        </ThemeProvider>
      </Provider>
    </Auth0Provider>
  );
};

export default api.withTRPC(MyApp);
