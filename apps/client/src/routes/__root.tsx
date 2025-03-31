import { Box, Container, Typography } from '@mui/material';
import { createRootRoute, useNavigate } from '@tanstack/react-router';
import { Button } from 'components/Button';
import { AppProviders } from 'layouts/AppProviders';
import { paths } from 'utils/paths';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          404
        </Typography>
        <Typography
          variant="h2"
          sx={{
            mt: 2,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary'
          }}
        >
          Page not found
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 3, color: 'text.secondary' }}>
          Sorry, we couldn’t find the page you’re looking for.
        </Typography>
        <Box
          sx={{
            mt: 5,
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate({ to: '/' })}
            sx={{ textTransform: 'none' }}
          >
            Go back home
          </Button>
          <Button
            variant="text"
            onClick={() => navigate({ to: paths.contact })}
            sx={{ textTransform: 'none' }}
          >
            Contact support &rarr;
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export const Route = createRootRoute({
  component: AppProviders,
  notFoundComponent: () => <NotFoundPage />
});
