import { useUser } from '@auth0/nextjs-auth0/client'
import { UserCircleIcon } from '@heroicons/react/20/solid'

export const Profile = () => {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white">
      <span className="sr-only">Your profile</span>
      <span aria-hidden="true">{user?.name}</span>

      {user?.picture ? (
        <img
          className="h-8 w-8 rounded-full bg-gray-800"
          src={user.picture}
          alt=""
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-800">
          <UserCircleIcon className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
