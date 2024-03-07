'use-client'
import { paths } from '@/utils/paths'
import { useUser } from '@auth0/nextjs-auth0/client'
import { Loader } from '../Loader'

export function AuthButton() {
  const { user, isLoading } = useUser()
  const isLoggedIn = !!user

  return (
    <a
      className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      href={isLoggedIn ? paths.logout : paths.login}
    >
      {isLoading ? <Loader /> : isLoggedIn ? 'Log out' : 'Log in'}
    </a>
  )
}
