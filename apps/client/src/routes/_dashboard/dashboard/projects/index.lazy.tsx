import { createLazyFileRoute } from '@tanstack/react-router';
import { ProjectsPage } from 'pages/ProjectsPage';

export const Route = createLazyFileRoute('/_dashboard/dashboard/projects/')({
  component: ProjectsPage
});
