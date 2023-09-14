import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await router.push('/api/auth/login');
    } catch (err) {
      console.log(err);
    }
  };

  return <Button onClick={() => handleLogin}>Log In</Button>;
};

export default LoginButton;
