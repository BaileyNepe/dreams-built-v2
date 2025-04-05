import { useSearch } from '@tanstack/react-router';
import { useDebounce } from './useDebounce';
import { useNavigate } from './useNavigate';

export const usePagination = () => {
  const { page, perPage, query } = useSearch({ strict: false });
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage + 1 }) });
  };

  const handlePerPageChange = (newPerPage: number) => {
    navigate({ search: (prev) => ({ ...prev, perPage: newPerPage }) });
  };

  const handleSearchChange = (newQuery: string) => {
    navigate({ search: (prev) => ({ ...prev, query: newQuery }) });
  };

  return {
    page: page || 1,
    perPage: perPage || 25,
    debouncedQuery,
    query,
    handlePageChange,
    handlePerPageChange,
    handleSearchChange
  };
};
