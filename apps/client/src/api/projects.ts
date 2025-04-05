import { notify } from 'libs/Notify';
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

export const useProjectsLargeList = () =>
  api.projects.list.useQuery({
    page: 1,
    perPage: 1000
  });

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

export const useNextJobNumberQuery = () =>
  api.projects.nextJobNumber.useSuspenseQuery()[0];

export const useCreateProjectMutation = () => {
  const utils = api.useUtils();

  return api.projects.create.useMutation({
    onSuccess: () => {
      notify('Project created successfully', { type: 'success' });
    },
    onSettled: () => {
      utils.projects.list.invalidate();
    }
  });
};

export const useUpdateProjectMutation = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  return api.projects.update.useMutation({
    onSuccess: () => {
      notify('Project updated successfully', { type: 'success' });
    },
    onSettled: () => {
      utils.projects.list.invalidate();
      utils.projects.get.invalidate(projectId);
      utils.reports.invalidate();
    }
  });
};

export const useProject = (projectId: string) =>
  api.projects.get.useSuspenseQuery(projectId)[0];
