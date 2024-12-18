'use client'

import PageLayout from 'components/PageLayout'
import { useRouter } from 'next/navigation'
import { type FC } from 'react'
import { paths } from 'utils/paths'

const Employees: FC = () => {
  const navigate = useRouter()

  return (
    <PageLayout
      title="Clients"
      description="List of clients in the system. Click on a client to view more details."
      onClick={() => {
        navigate.push(paths.clientCreate)
      }}
    >
      Employees
    </PageLayout>
  )
}

export default Employees
