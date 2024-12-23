import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Checkbox } from '@mui/material';
import { useProjectList } from 'api/projects';
import { EnhancedTable } from 'components/EnhancedTable';
import { Color } from 'components/EnhancedTable/components/Color';
import PageLayout from 'layouts/PageLayout';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';

export const ProjectsPage = () => {
  const navigate = useNavigate();
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

  return (
    <PageLayout
      title="Jobs"
      description="List of jobs in the system. Click on a job to view more details. Click on the button to create a new job"
      onClick={() => {
        navigate({ to: paths.jobsCreate });
      }}
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
          { id: 'endClient', width: '10%' },
          { id: 'address', width: '25%' },
          { id: 'city' },
          { id: 'area', width: '1rem' },
          { id: 'isInvoiced', label: 'Invoiced', width: '1rem' },
          { id: 'actions', width: '1rem' }
        ]}
        rows={data?.projects.map((job) => ({
          id: job.id,
          jobNumber: job.jobNumber,
          client: <Color color={job.clientColor} text={job.client} type="background" />,
          endClient: job.endClient,
          address: job.address,
          city: job.city,
          area: job.area,
          isInvoiced: <Checkbox checked={job.isInvoiced} />,
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
