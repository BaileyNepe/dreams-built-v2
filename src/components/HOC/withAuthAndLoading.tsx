import { User, useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import React, { ComponentType } from 'react';

import Loader from '../ui/atoms/Loader';
import Message from '../ui/atoms/Message';

const withAuth = <P extends {}>(WrappedComponent: ComponentType<P>): React.FC<P> => {
  const AuthAndLoadingWrapper: React.FC<P> = (props) => {
    const { isLoading, error } = useAuth0();

    if (isLoading) {
      return <Loader />;
    }

    if (error) {
      return <Message variant="danger">{error.message}</Message>;
    }

    return <WrappedComponent {...props} />;
  };

  return withAuthenticationRequired(AuthAndLoadingWrapper, {
    onRedirecting: () => <Loader />,
  });
};

export default withAuth;
