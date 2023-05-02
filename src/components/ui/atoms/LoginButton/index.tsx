import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/api/auth/login');
  };

  return <Button onClick={handleLogin}>Log In</Button>;
};

export default LoginButton;
