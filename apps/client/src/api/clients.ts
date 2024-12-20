import { api } from './trpc';

export const useClientList = (params: {
  page: number;
  perPage: number;
  query?: string;
}) => api.client.list.useQuery(params);
