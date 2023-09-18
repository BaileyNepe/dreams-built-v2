import { useUser } from '@/components/utils/hooks/useUser';
import Loader from '../../atoms/Loader';
import Message from '../../atoms/Message';

const AdminGroup = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading, error, user } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return <Message variant='danger'>Something went wrong contact an admin</Message>;
  }

  if (user) {
    if (isAdmin) {
      return <>{children}</>;
    }

    return <Message variant='danger'>You do not have permission to view this page</Message>;
  }

  return <Message variant='danger'>You must be logged in as an admin to view this page</Message>;
};

export default AdminGroup;
