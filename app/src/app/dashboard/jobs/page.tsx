'use client'
import { useJobsList } from 'api/jobs'
import { Button } from 'components/Button'
import PageLayout from 'components/PageLayout'
import { Table } from 'components/Table'
import { useRouter } from 'next/navigation'
import { paths } from 'utils/paths'

const JobsList = () => {
  const navigate = useRouter()
  const jobsList = useJobsList({ page: 1, perPage: 10 })
  return (
    <PageLayout
      title="Jobs"
      description="List of jobs in the system. Click on a job to view more details. Click on the button to create a new job"
      onClick={() => {
        navigate.push(paths.jobsCreate)
      }}
    >
      <Table
        pagination={{
          page: 1,
          perPage: 10,
          total: jobsList.total,
          onChange: (page) => {
            console.log(page)
          },
        }}
        headers={[
          { key: 'jobNumber' },
          { key: 'client' },
          { key: 'endClient' },
          { key: 'address' },
          { key: 'city' },
          { key: 'area' },
          { key: 'edit' },
        ]}
        rows={jobsList.jobs.map((job) => ({
          id: job.id,
          jobNumber: job.jobNumber,
          client: job.client,
          endClient: job.endClient,
          address: job.address,
          city: job.city,
          area: job.area,
          edit: (
            <Button
              onClick={() => {
                navigate.push(paths.jobsEdit(job.id))
              }}
            >
              Edit
            </Button>
          ),
        }))}
      />
    </PageLayout>
  )
}

export default JobsList
