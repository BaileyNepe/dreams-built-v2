import { PaginationSchema } from '@dreams-built/shared/src/pagination/types';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dashboard/clients/')({
  validateSearch: PaginationSchema
});
