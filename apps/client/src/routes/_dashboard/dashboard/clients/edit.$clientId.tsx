import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_dashboard/dashboard/clients/edit/$clientId')({
  params: z.object({
    clientId: z.string()
  })
});

export const useClientParams = () => Route.useParams();
