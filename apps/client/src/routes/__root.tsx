import { createRootRoute } from '@tanstack/react-router';
import { AppProviders } from 'layouts/AppProviders';

export const Route = createRootRoute({
  component: AppProviders,
  notFoundComponent: () => <div>Not Found anything</div>
});
