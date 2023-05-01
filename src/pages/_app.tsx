import { env } from '@/env.mjs';
import { api } from '@/utils/api';
import { type AppType } from 'next/app';
import 'react-toastify/dist/ReactToastify.css';

import '@styles/bootstrap.min.css';

import { store } from '@/components/store';
import { theme } from '@/components/theme';
import '@/styles/globals.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Auth0Provider
      domain={env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
    >
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ToastContainer theme="colored" />
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </Auth0Provider>
  );
};

export default api.withTRPC(MyApp);
