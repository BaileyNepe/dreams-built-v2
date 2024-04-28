'use client'
import PageLayout from '@/components/PageLayout'
import { Table } from '@/components/Table'
import { api } from '@/trpc/react'
import { paths } from '@/utils/paths'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'

const Clients = () => {
  const navigate = useRouter()

  const users = api.client.list.useQuery()

  console.log({ users: users.data })
  return (
    <PageLayout
      title="Clients"
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
        headers={[
          { key: 'name', label: 'Name' },
          { key: 'title', label: 'Title' },
          { key: 'email', label: 'Email' },
        ]}
        rows={[
          {
            id: '1',
            name: 'Lindsay Walton',
            title: 'Front-end Developer',
            email: 'abe@gmail.com',
          },
          {
            id: '2',
            name: 'Lindsay Walton',
            title: 'Front-end Developer',
            email: 'test@gmail.com',
          },
        ]}
      />
    </PageLayout>
  )
}

export default Clients
