import React, { ComponentType } from 'react';

import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { UserProps } from '@auth0/nextjs-auth0/dist/client/with-page-auth-required';
import Loader from '../ui/atoms/Loader';
import Message from '../ui/atoms/Message';

const withAuth = <P extends UserProps>(WrappedComponent: ComponentType<P>): React.FC<P> => {
  const AuthAndLoadingWrapper: React.FC<P> = (props) => {
    const { isLoading, error, user } = useUser();

    if (isLoading) {
      return <Loader />;
    }

    if (error) {
      return <Message variant="danger">{error.message}</Message>;
    }

    return <WrappedComponent {...props} user={user} />;
  };

  return withPageAuthRequired(AuthAndLoadingWrapper, {
    onRedirecting: () => <Loader />,
  });
};

export default withAuth;
