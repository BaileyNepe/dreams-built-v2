'use client'
import { useUser } from '@auth0/nextjs-auth0/client'
import React from 'react'

const Dashboard = () => {
  const { user } = useUser()

  console.log(user)
  return <div>Dashboard</div>
}

export default Dashboard
