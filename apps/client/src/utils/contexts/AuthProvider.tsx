import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useProfileQuery } from 'api/user';

import { env } from 'config/env';

import { useCallback, type FC, type PropsWithChildren } from 'react';

// ==============================|| AUTH HOOKS ||============================== //

export const useAuthInit = () => {
  const auth = useAuth0();

  if (!auth) throw new Error('useAuth must be used within an AuthProvider.');

  if (auth.error) throw auth.error;

  const getAccessToken = useCallback(async () => {
    if (auth.isAuthenticated) {
      return auth.getAccessTokenSilently();
    }

    return null;
  }, [auth]);

  return { ...auth, getAccessToken, authSub: auth.user?.sub ?? '' };
};

export const useAuthOptionalUser = () => {
  const auth = useAuthInit();

  const login = useProfileQuery({
    enabled: auth.isAuthenticated && !auth.isLoading,
    firstName: auth.user?.given_name ?? '',
    lastName: auth.user?.family_name ?? '',
    email: auth.user?.email ?? '',
    image: auth.user?.picture ?? ''
  });

  const user = login.data ? { ...auth.user, ...login.data } : null;

  return {
    ...auth,
    user: user ?? undefined,
    isAuthenticated: auth.isAuthenticated && login.data?.id,
    isLoading: (login.isLoading && auth.isAuthenticated) || auth.isLoading,
    isError: auth.error || login.isError,
    errorMessage: auth.error?.message ?? login.error?.message ?? ''
  };
};

export const useAuth = () => {
  const auth = useAuthOptionalUser();
  if (auth.user) {
    return {
      ...auth,
      user: auth.user
    };
  }

  throw new Error('useAuth must be used within an authenticated context');
};

export type User = ReturnType<typeof useAuth>['user'];

export const AuthContext: FC<PropsWithChildren> = ({ children }) => (
  <Auth0Provider
    domain={env.auth0Domain}
    clientId={env.auth0ClientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: env.auth0Audience
    }}
    onRedirectCallback={(appState) => {
      // Get the intended URL from appState or use current path
      const targetUrl = appState?.returnTo || window.location.pathname;

      // If user was redirected to root and is authenticated, go to dashboard
      // Otherwise, go to their intended page
      const finalUrl = targetUrl === '/' ? '/dashboard' : targetUrl;

      window.history.replaceState({}, '', finalUrl);
    }}
    cacheLocation="localstorage" // This ensures auth state persists across page refreshes
  >
    <>{children}</>
  </Auth0Provider>
);
