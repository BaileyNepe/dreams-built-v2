import { useAuth0 } from '@auth0/auth0-react';
import { type NextPage } from 'next';
import { Container } from 'react-bootstrap';

const Home: NextPage = () => {
  const { isAuthenticated } = useAuth0();
  return (
    <>
      {isAuthenticated ? (
        <div>
          <h1>Home</h1>
          <p>Logged in</p>
        </div>
      ) : (
        <Container />
      )}
    </>
  );
};

export default Home;
