import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = async (): Promise<void> => {
    try {
      await router.push('/api/auth/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Button
      onClick={() => {
        void handleLogin();
      }}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
