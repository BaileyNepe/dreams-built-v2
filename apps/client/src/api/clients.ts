import { notify } from 'libs/Notify';
import { api } from './trpc';

export const useClientList = (params: {
  page: number;
  perPage: number;
  query?: string;
}) => api.clients.list.useQuery(params);

export const useClientsList = () =>
  api.clients.list.useSuspenseQuery({
    page: 1,
    perPage: 1000
  })[0];

export const useClient = (clientId: string) =>
  api.clients.get.useSuspenseQuery(clientId)[0];

export const useCreateClientMutation = () => {
  const utils = api.useUtils();

  return api.clients.create.useMutation({
    onSuccess: () => {
      notify('Client created successfully', { type: 'success' });
    },
    onSettled: () => {
      utils.clients.list.invalidate();
    }
  });
};

export const useUpdateClientMutation = ({ clientId }: { clientId: string }) => {
  const utils = api.useUtils();
  return api.clients.update.useMutation({
    onSuccess: () => {
      notify('Client updated successfully', { type: 'success' });
    },
    onSettled: () => {
      utils.clients.list.invalidate();
      utils.projects.invalidate();
      utils.clients.get.invalidate(clientId);
    }
  });
};
