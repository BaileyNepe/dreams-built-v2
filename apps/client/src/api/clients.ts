import { api } from './trpc';

export const useClientList = (params: {
  page: number;
  perPage: number;
  query?: string;
}) => api.clients.list.useQuery(params);
