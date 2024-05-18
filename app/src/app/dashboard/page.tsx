'use client'
import { useUser } from '@auth0/nextjs-auth0/client'
import React from 'react'

const Dashboard = () => {
  const { user } = useUser()

  return (
    <div>
      <p>dashboard</p>
    </div>
  )
}

export default Dashboard
