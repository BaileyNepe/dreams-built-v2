import { createLazyFileRoute } from '@tanstack/react-router';

import { authz } from '@dreams-built/shared/src/auth/permissions';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Checkbox } from '@mui/material';
import { useProjectList, useToggleInvoiceProject } from 'api/projects';
import { api } from 'api/trpc';
import { EnhancedTable } from 'components/EnhancedTable';
import { Color } from 'components/EnhancedTable/components/Color';
import PageLayout from 'layouts/PageLayout';
import { useDebouncedCallback } from 'use-debounce';
import { useAuth } from 'utils/contexts/AuthProvider';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const toggleInvoiceProject = useToggleInvoiceProject();
  const { user } = useAuth();
  const {
    data,
    isLoading,
    pagination: {
      page,
      perPage,
      handlePageChange,
      handlePerPageChange,
      query,
      handleSearchChange
    }
  } = useProjectList();

  const apiUtils = api.useUtils();
  const prefetch = useDebouncedCallback((id: string) => {
    apiUtils.projects.get.prefetch(id);
  }, 50);

  const hasEditPermission = useAuth().user.permissions?.includes(authz.jobs_edit);

  return (
    <PageLayout
      title="Projects"
      description="List of jobs in the system. Click on a job to view more details. Click on the button to create a new job"
      to={hasEditPermission ? paths.projectsCreate : undefined}
    >
      <EnhancedTable
        toolbar={{
          search: {
            placeholder: 'Search jobs...',
            onChange: handleSearchChange,
            value: query
          }
        }}
        pagination={{
          page,
          perPage,
          total: data?.total,
          handlePageChange,
          handlePerPageChange
        }}
        order={{
          sort: 'desc',
          sortBy: 'jobNumber',
          setOrder: () => {}
        }}
        isLoading={isLoading}
        headers={[
          { id: 'jobNumber', width: '10%' },
          { id: 'client', width: '10%', align: 'center' },
          { id: 'address', width: '100%' },
          { id: 'city' },
          { id: 'endClient', width: '10%' },
          { id: 'area', width: '1rem' },
          { id: 'isInvoiced', label: 'Invoiced', width: '1rem' },
          { id: 'actions', width: '1rem' }
        ]}
        onRowEnter={prefetch}
        onRowLeave={prefetch.cancel}
        rows={data?.projects.map((job) => ({
          id: job.id,
          jobNumber: (
            <Color color={job.color} text={job.jobNumber.toString().padStart(5, '0')} />
          ),
          client: <Color color={job.clientColor} text={job.client} type="background" />,
          endClient: job.endClient,
          address: job.address,
          city: job.city,
          area: job.area,
          isInvoiced: (
            <Checkbox
              checked={job.isInvoiced}
              onClick={(e) => {
                e.stopPropagation();
                toggleInvoiceProject.mutate({
                  projectId: job.id,
                  isInvoiced: !job.isInvoiced
                });
              }}
              disabled={!user.permissions?.includes(authz.jobs_edit)}
            />
          ),
          actions: [
            {
              icon: <EditRoundedIcon />,
              label: 'Edit',
              onClick: () => {
                navigate({ to: paths.projectsEdit, params: { projectId: job.id } });
              }
            }
          ]
        }))}
      />
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/projects/')({
  component: ProjectsPage
});
