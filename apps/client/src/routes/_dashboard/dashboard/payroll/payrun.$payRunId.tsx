import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_dashboard/dashboard/payroll/payrun/$payRunId')({
  params: z.object({
    payRunId: z.string()
  })
});

export const usePayRunParams = () => Route.useParams();
