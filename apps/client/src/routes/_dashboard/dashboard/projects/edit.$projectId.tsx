import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_dashboard/dashboard/projects/edit/$projectId')({
  params: z.object({
    projectId: z.string()
  })
});

export const useProjectParams = () => Route.useParams();
