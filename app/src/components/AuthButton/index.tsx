'use-client'

import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import { paths } from 'utils/paths'

export function AuthButton() {
  const { user } = useUser()
  const isLoggedIn = !!user

  return (
    <Link
      className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      href={isLoggedIn ? paths.logout : paths.login}
    >
      {isLoggedIn ? 'Log out' : 'Log in'}
    </Link>
  )
}
