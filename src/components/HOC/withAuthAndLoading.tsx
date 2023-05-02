import { User, useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import React, { ComponentType } from 'react';

import Loader from '../ui/atoms/Loader';
import Message from '../ui/atoms/Message';

interface UserProps {
  user: User;
}

const withAuth = <P extends UserProps>(WrappedComponent: ComponentType<P>) => {
  const AuthAndLoadingWrapper: React.FC<P> = (props) => {
    const { isLoading, error, user } = useAuth0();

    if (isLoading) {
      return <Loader />;
    }

    if (error || !user) {
      return <Message variant="danger">{error?.message ?? 'User not found'}</Message>;
    }

    return <WrappedComponent {...props} user={user} />;
  };

  return withAuthenticationRequired(AuthAndLoadingWrapper, {
    onRedirecting: () => <Loader />,
  });
};
export default withAuth;
