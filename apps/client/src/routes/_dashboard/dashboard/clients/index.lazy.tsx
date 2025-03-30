import { authz } from '@dreams-built/shared/src/auth/permissions';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useClientList } from 'api/clients';
import { api } from 'api/trpc';
import { EnhancedTable } from 'components/EnhancedTable';
import { Color } from 'components/EnhancedTable/components/Color';
import PageLayout from 'layouts/PageLayout';
import { type FC } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useAuth } from 'utils/contexts/AuthProvider';
import { useNavigate } from 'utils/hooks/useNavigate';
import { usePagination } from 'utils/hooks/usePagination';
import { paths } from 'utils/paths';

export const ClientsPage: FC = () => {
  const navigate = useNavigate();
  const {
    page,
    perPage,
    handlePageChange,
    handlePerPageChange,
    query,
    debouncedQuery,
    handleSearchChange
  } = usePagination();
  const clients = useClientList({ page, perPage, query: debouncedQuery });
  const apiUtils = api.useUtils();
  const prefetch = useDebouncedCallback((id: string) => {
    apiUtils.clients.get.prefetch(id);
  }, 50);

  const hasEditPermissions = useAuth().user.permissions.includes(authz.clients_edit);

  return (
    <PageLayout
      title="Clients"
      description="List of clients in the system. Click on a client to view more details."
      to={hasEditPermissions ? paths.clientCreate : undefined}
    >
      <EnhancedTable
        toolbar={{
          search: {
            placeholder: 'Search clients...',
            onChange: handleSearchChange,
            value: query
          }
        }}
        pagination={{
          page,
          perPage,
          total: clients.data?.total,
          handlePageChange,
          handlePerPageChange
        }}
        isLoading={clients.isLoading}
        order={{
          sort: 'asc',
          sortBy: 'name',
          setOrder: () => {}
        }}
        headers={[
          { id: 'color', align: 'center', label: 'Colour' },
          { id: 'name', width: '100%' },
          ...(hasEditPermissions ? [{ id: 'actions' }] : [])
        ]}
        size="medium"
        onRowEnter={prefetch}
        onRowLeave={prefetch.cancel}
        rows={clients.data?.clients.map((client) => ({
          id: client.id,
          name: client.name,
          color: <Color color={client.color} />,
          actions: hasEditPermissions
            ? [
                {
                  icon: <EditRoundedIcon />,
                  label: 'Edit',
                  onClick: () => {
                    navigate({ to: paths.clientEdit, params: { clientId: client.id } });
                  }
                }
              ]
            : []
        }))}
      />
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/clients/')({
  component: ClientsPage
});
