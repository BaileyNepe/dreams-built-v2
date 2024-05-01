'use client'

import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'
import { Dashboard } from 'components/Dashboard'
import { Loader } from 'components/Loader'

const RootLayout = withPageAuthRequired(Dashboard, {
  returnTo: '/',
  onRedirecting: () => (
    <Dashboard>
      <Loader />
    </Dashboard>
  ),
})

export default RootLayout
