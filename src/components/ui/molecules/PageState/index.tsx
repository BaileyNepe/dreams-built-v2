import Loader from '../../atoms/Loader';
import Message from '../../atoms/Message';

const PageState = ({
  children,
  loading,
  error,
}: {
  children: React.ReactNode;
  loading: boolean;
  error?: string;
}) => <>{loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : children}</>;

export default PageState;
