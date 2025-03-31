import { createLazyFileRoute } from '@tanstack/react-router';
import { EnhancedTable } from 'components/EnhancedTable';
import PageLayout from 'layouts/PageLayout';
import { type FC } from 'react';

const Page: FC = () => (
  <PageLayout title="Employees" description="Manage your employees">
    <EnhancedTable
      headers={[
        { id: 'name', width: '30%' },
        { id: 'email', width: '30%' },
        { id: 'phone', width: '20%' },
        { id: 'actions', width: '20%' }
      ]}
      rows={[]}
      toolbar={{
        search: {
          placeholder: 'Search employees...',
          onChange: () => {},
          value: ''
        }
      }}
      pagination={{
        page: 1,
        perPage: 10,
        total: 0,
        handlePageChange: () => {},
        handlePerPageChange: () => {}
      }}
      order={{
        sort: 'asc',
        sortBy: 'name',
        setOrder: () => {}
      }}
      isLoading={false}
    />
  </PageLayout>
);

export const Route = createLazyFileRoute('/_dashboard/dashboard/employees/')({
  component: Page
});
