'use client'
import PageLayout from 'components/PageLayout'
import { Table } from 'components/Table'
import { useRouter } from 'next/navigation'
import React from 'react'

const JobsList = () => {
  const navigate = useRouter()
  return (
    <PageLayout
      title="Jobs"
      description="List of clients in the system. Click on a client to view more details."
      onClick={() => {
        navigate.push(paths.clientCreate)
      }}
    >
      <Table
        pagination={{
          page: 1,
          perPage: 10,
          total: 100,
          onChange: (page) => {
            console.log(page)
          },
        }}
        headers={[{ key: 'color' }, { key: 'name' }, { key: 'edit' }]}
        rows={[]}
      />
    </PageLayout>
  )
}

export default JobsList
