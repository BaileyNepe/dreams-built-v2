import { useAuth0 } from '@auth0/auth0-react';
import { type NextPage } from 'next';

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
        <div>
          <h1>Home</h1>
          <p>Not logged in</p>
        </div>
      )}
    </>
  );
};

export default Home;
