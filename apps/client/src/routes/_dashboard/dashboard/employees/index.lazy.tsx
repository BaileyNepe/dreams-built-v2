import { type Role } from '@dreams-built/shared/src/auth/types';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useUsers } from 'api/user';
import { UserAvatar } from 'components/Avatar';
import { EnhancedTable } from 'components/EnhancedTable';
import PageLayout from 'layouts/PageLayout';
import { type FC } from 'react';
import styled from 'styled-components';
import { formatDate } from 'utils/date';
import { useFilteredPaginatedList } from 'utils/hooks/useStaticPagination';
import { paths } from 'utils/paths';

const getColor = (role: Role) => {
  switch (role) {
    case 'ADMIN':
      return 'info';
    case 'MANAGER':
      return 'info';
    case 'EMPLOYEE':
      return 'success';
    case 'USER':
      return 'error';
    default:
      return 'error';
  }
};

const Tag = styled.div<{ $color: ReturnType<typeof getColor> }>`
  background-color: ${({ theme, $color }) => theme.palette[$color].lightest};
  border: 1px solid ${({ theme, $color }) => theme.palette[$color].main};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  color: ${({ theme, $color }) => theme.palette[$color].main};
  font-size: 0.6rem;
  font-weight: 500;
  font-weight: bold;
  padding: 0 0.5rem;
  text-transform: capitalize;
  width: max-content;
`;

const Page: FC = () => {
  const navigate = useNavigate();
  const users = useUsers({
    showAll: true
  });

  const {
    query,
    paginatedList,
    total,
    pagination,
    order,
    handleSearchChange,
    handleOrderChange
  } = useFilteredPaginatedList({
    initialList: users.data,
    filterFunction: (item, q) =>
      item.firstName.toLowerCase().includes(q.toLowerCase()) ||
      item.lastName.toLowerCase().includes(q.toLowerCase()) ||
      item.email.toLowerCase().includes(q.toLowerCase()) ||
      item.role.toLowerCase().includes(q.toLowerCase()),
    defaultSortBy: 'lastActive',
    sort: 'desc'
  });

  return (
    <PageLayout title="Employees" description="Manage your employees">
      <EnhancedTable
        headers={[
          { id: 'user' },
          { id: 'email' },
          { id: 'hourlyRate' },
          { id: 'role' },
          { id: 'lastActive' },
          { id: 'actions', align: 'right' }
        ]}
        rows={
          paginatedList.map((user) => ({
            id: user.id,
            user: (
              <UserAvatar
                image={user.image}
                name={`${user.firstName} ${user.lastName}`}
              />
            ),
            hourlyRate: `$${user.hourlyRate.toFixed(2)}`,
            role: (
              <Tag $color={getColor(user.role)} role={user.role}>
                {user.role}
              </Tag>
            ),

            lastActive: formatDate(user.lastActive, 'HH:mm - d/MM/yyyy'),
            email: user.email,
            actions: [
              {
                icon: <EditRoundedIcon />,
                label: 'Edit',
                onClick: () =>
                  navigate({
                    to: paths.employeeEdit,
                    params: { employeeId: user.id }
                  })
              }
            ]
          })) ?? []
        }
        toolbar={{
          search: {
            placeholder: 'Search employees...',
            onChange: handleSearchChange,
            value: query
          }
        }}
        pagination={{
          page: pagination.page,
          perPage: pagination.perPage,
          total,
          handlePageChange: pagination.handlePageChange,
          handlePerPageChange: pagination.handlePerPageChange
        }}
        order={{
          sort: order.sort,
          sortBy: order.sortBy,
          setOrder: handleOrderChange
        }}
        isLoading={users.isLoading}
      />
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/employees/')({
  component: Page
});
