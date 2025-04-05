import { createLazyFileRoute } from '@tanstack/react-router';
import { Dashboard } from 'layouts/Dashboard';

export const Route = createLazyFileRoute('/_dashboard')({
  component: Dashboard
});
