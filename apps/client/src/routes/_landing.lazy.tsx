import { createLazyFileRoute } from '@tanstack/react-router';
import { LandingLayout } from 'layouts/LandingLayout';

export const Route = createLazyFileRoute('/_landing')({
  component: LandingLayout
});
