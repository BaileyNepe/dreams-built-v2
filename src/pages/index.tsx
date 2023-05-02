import StandardLayout from '@/components/Layouts/Standard';
import Dashboard from '@/components/ui/organisms/Dashboard';
import { useAuth0 } from '@auth0/auth0-react';
import { type NextPage } from 'next';
import { Container } from 'react-bootstrap';

const Home: NextPage = () => {
  const { isAuthenticated } = useAuth0();
  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <StandardLayout>
          <Container>
            <h1>Home</h1>
          </Container>
        </StandardLayout>
      )}
    </>
  );
};

export default Home;
