import { createLazyFileRoute } from '@tanstack/react-router';
import { JobSheetPage } from 'features/JobSheet';

export const Route = createLazyFileRoute(
  '/_dashboard/dashboard/projects/jobsheet/$projectId'
)({
  component: JobSheetPage
});
