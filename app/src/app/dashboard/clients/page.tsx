'use client'

import PageLayout from 'components/PageLayout'
import { Table } from 'components/Table'
import { useRouter } from 'next/navigation'
import { api } from 'trpc/react'
import { paths } from 'utils/paths'

const Clients = () => {
  const navigate = useRouter()
  const [clients] = api.client.list.useSuspenseQuery({
    page: 1,
    perPage: 10,
  })

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
        headers={[{ key: 'color' }, { key: 'name' }]}
        rows={clients.map((client) => ({
          id: client.id,
          name: client.name,
          color: (
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: client.color }}
            />
          ),
        }))}
      />
    </PageLayout>
  )
}

export default Clients
