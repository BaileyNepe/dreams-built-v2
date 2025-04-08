import { useMemo, useState } from 'react';

const parseDateValue = (val: unknown): number => {
  if (typeof val === 'string' || typeof val === 'number') {
    return new Date(val).getTime();
  } else if (val instanceof Date) {
    return val.getTime();
  }
  return NaN;
};

export const useFilteredPaginatedList = <T,>({
  initialList = [],
  filterFunction,
  initialPerPage = 50,
  defaultSortBy,
  sortDisabled = false,
  sort = 'asc'
}: {
  initialList?: T[];
  sortDisabled?: boolean;
  filterFunction: (item: T, query: string) => boolean;
  initialPerPage?: number;
  defaultSortBy?: keyof T;
  sort?: 'asc' | 'desc';
}) => {
  type Sorting = {
    sort: 'asc' | 'desc';
    sortBy: keyof T;
  };

  const [query, setQuery] = useState('');

  // Determine the defaultSortBy based on the first item's keys, if not provided
  const inferredDefaultSortBy =
    defaultSortBy ?? (Object.keys(initialList[0] ?? {})[0] as keyof T);

  const [pagination, setPagination] = useState({ page: 1, perPage: initialPerPage });
  const [order, setOrder] = useState<Sorting>({
    sort,
    sortBy: inferredDefaultSortBy
  });

  const sortedAndFilteredList = useMemo(() => {
    const filtered = initialList.filter((item) => filterFunction(item, query));

    if (order.sortBy && !sortDisabled) {
      return filtered
        .filter((item) => item[order.sortBy] !== undefined && item[order.sortBy] !== null)
        .sort((a, b) => {
          const aValue = a[order.sortBy];
          const bValue = b[order.sortBy];

          // Attempt to parse both values as dates.
          const aTime = parseDateValue(aValue);
          const bTime = parseDateValue(bValue);

          // If both values are valid dates, compare by timestamp.
          if (!isNaN(aTime) && !isNaN(bTime)) {
            if (aTime < bTime) return order.sort === 'asc' ? -1 : 1;
            if (aTime > bTime) return order.sort === 'asc' ? 1 : -1;
            return 0;
          }

          // Fallback to default comparison.
          if (aValue < bValue) return order.sort === 'asc' ? -1 : 1;
          if (aValue > bValue) return order.sort === 'asc' ? 1 : -1;
          return 0;
        });
    }

    return filtered;
  }, [query, initialList, order.sortBy, order.sort, sortDisabled, filterFunction]);

  const paginatedList = useMemo(() => {
    const start = (pagination.page - 1) * pagination.perPage;
    const end = start + pagination.perPage;
    return sortedAndFilteredList.slice(start, end);
  }, [sortedAndFilteredList, pagination]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page on search
  };

  const handlePageChange = (page: number) =>
    setPagination((prev) => ({ ...prev, page: page + 1 }));
  const handlePerPageChange = (perPage: number) => setPagination({ page: 1, perPage });
  const handleOrderChange = ({ sort: s, sortBy }: Sorting) =>
    setOrder({ sort: s, sortBy });

  return {
    query,
    paginatedList,
    total: sortedAndFilteredList.length,
    pagination: {
      ...pagination,
      handlePageChange,
      handlePerPageChange
    },
    order,
    setOrder,
    handleSearchChange,
    handleOrderChange
  };
};
