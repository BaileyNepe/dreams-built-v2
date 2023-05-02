import Dashboard from '@/components/ui/organisms/Dashboard';
import { UserProfile } from '@auth0/nextjs-auth0/client';
import { Container } from 'react-bootstrap';

const Home = ({ user }: { user?: UserProfile }) => {
  return (
    <>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <Container>
          <h1>Home</h1>
        </Container>
      )}
    </>
  );
};

export default Home;
