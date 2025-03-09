import { createLazyFileRoute } from '@tanstack/react-router';
import { Schedule } from 'features/Schedule';

const Page = () => <Schedule />;

export const Route = createLazyFileRoute('/_dashboard/dashboard/schedule')({
  component: Page
});
