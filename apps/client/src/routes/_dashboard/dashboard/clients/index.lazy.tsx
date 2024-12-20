import { createLazyFileRoute } from '@tanstack/react-router';
import { ClientsPage } from 'pages/ClientsPage';

export const Route = createLazyFileRoute('/_dashboard/dashboard/clients/')({
  component: ClientsPage
});
