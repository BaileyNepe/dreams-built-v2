import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute(
  '/_dashboard/dashboard/projects/jobsheet/$projectId'
)({
  params: z.object({
    projectId: z.string()
  })
});

export const useJobSheetParams = () => Route.useParams();
