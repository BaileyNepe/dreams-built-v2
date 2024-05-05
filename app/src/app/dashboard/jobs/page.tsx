'use client'
import { useJobsList } from 'api/jobs'
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
          { key: 'jobNumber', label: 'Job Number' },
          { key: 'client' },
          { key: 'endClient' },
          { key: 'address' },
          { key: 'city' },
          { key: 'area' },
          { key: 'edit' },
        ]}
        rows={jobsList.jobs}
      />
    </PageLayout>
  )
}

export default JobsList
