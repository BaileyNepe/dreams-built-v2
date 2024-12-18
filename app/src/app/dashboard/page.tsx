'use client'
import { useUser } from '@auth0/nextjs-auth0/client'

const Dashboard = () => {
  const { user } = useUser()

  return (
    <div>
      <p>dashboard</p>
    </div>
  )
}

export default Dashboard
