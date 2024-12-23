import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useClientList } from 'api/clients';
import { EnhancedTable } from 'components/EnhancedTable';
import { Color } from 'components/EnhancedTable/components/Color';
import PageLayout from 'layouts/PageLayout';
import { type FC } from 'react';
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

  return (
    <PageLayout
      title="Clients"
      description="List of clients in the system. Click on a client to view more details."
      onClick={() => {
        navigate({ to: paths.clientCreate });
      }}
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
          { id: 'color', width: '1rem', align: 'center' },
          { id: 'name', width: '100%' },
          { id: 'actions' }
        ]}
        rows={clients.data?.clients.map((client) => ({
          id: client.id,
          name: client.name,
          color: <Color color={client.color} />,
          actions: [
            {
              icon: <EditRoundedIcon />,
              label: 'Edit',
              onClick: () => {
                navigate({ to: paths.clientEdit, params: { clientId: client.id } });
              }
            }
          ]
        }))}
      />
    </PageLayout>
  );
};
