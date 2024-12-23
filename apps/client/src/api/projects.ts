import { usePagination } from 'utils/hooks/usePagination';
import { api } from './trpc';

export const useProjectList = () => {
  const pagination = usePagination();
  const apiRequest = api.project.list.useQuery({
    ...pagination,
    query: pagination.debouncedQuery
  });

  return {
    ...apiRequest,
    pagination
  };
};
