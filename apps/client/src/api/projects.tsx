'use client';
import { usePagination } from 'utils/hooks/usePagination';
import { api } from './trpc';

export const useProjectList = () => {
  const pagination = usePagination();
  const apiRequest = api.projects.list.useQuery({
    page: pagination.page,
    perPage: pagination.perPage,
    query: pagination.debouncedQuery
  });

  return {
    ...apiRequest,
    pagination
  };
};

export const useToggleInvoiceProject = () => {
  const utils = api.useUtils();
  const pagination = usePagination();

  return api.projects.toggleInvoiced.useMutation({
    onMutate: async ({ projectId, isInvoiced }) => {
      // 1) Cancel any outgoing fetches so they don't overwrite our optimistic update
      await utils.projects.list.cancel();

      // 2) Snapshot the previous cache value
      const prevData = utils.projects.list.getData({
        page: pagination.page,
        perPage: pagination.perPage,
        query: pagination.debouncedQuery
      });

      // 3) Optimistically update the cache
      if (prevData) {
        utils.projects.list.setData(
          {
            page: pagination.page,
            perPage: pagination.perPage,
            query: pagination.debouncedQuery
          },
          {
            ...prevData,
            projects: prevData.projects.map((project) =>
              project.id === projectId ? { ...project, isInvoiced } : project
            )
          }
        );
      }

      // Return the snapshot so we can roll back if there’s an error
      return { prevData };
    },

    // 4) Roll back on error
    onError: (_error, _variables, context) => {
      if (context?.prevData) {
        utils.projects.list.setData(
          {
            page: pagination.page,
            perPage: pagination.perPage,
            query: pagination.debouncedQuery
          },
          context.prevData
        );
      }
    },

    onSuccess: () => {
      utils.projects.list.invalidate();
    }
  });
};

export const useInfiniteProjects = ({
  query,
  enabled = true
}: {
  query?: string;
  enabled?: boolean;
}) =>
  api.projects.infiniteList.useInfiniteQuery(
    {
      query,
      limit: 1
    },
    {
      enabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
    }
  );
