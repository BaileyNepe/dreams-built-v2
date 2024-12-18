import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useLoginQuery } from 'api/queries/user';
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

export const useAuth = () => {
  const auth = useAuthInit();

  const login = useLoginQuery({
    authKey: auth.authSub,
    enabled: auth.isAuthenticated,
    firstName: auth.user?.given_name ?? '',
    lastName: auth.user?.family_name ?? '',
    email: auth.user?.email ?? '',
    image: auth.user?.picture ?? ''
  });

  const user = { ...auth.user, ...login.data?.user };

  return {
    ...auth,
    user,
    isAuthenticated: auth.isAuthenticated && login.data?.user.id,
    isLoading: (login.isLoading && auth.isAuthenticated) || auth.isLoading,
    isError: auth.error || login.isError,
    errorMessage: auth.error?.message ?? login.error?.message ?? ''
  };
};

export type User = ReturnType<typeof useAuth>['user'];

export const AuthContext: FC<PropsWithChildren> = ({ children }) => (
  <Auth0Provider
    domain={env.auth0Domain}
    clientId={env.auth0ClientId}
    authorizationParams={{
      audience: env.auth0Audience,
      redirect_uri: window.location.origin
    }}
  >
    <>{children}</>
  </Auth0Provider>
);
