import { authz, permissions } from './permissions'
import { Authz, Role, Roles } from './types'

const rolesRaw: Roles = [
  {
    id: 'ADMIN',
    name: 'Admin',
    permissions: [authz.roles_view_all],
  },
  {
    id: 'MANAGER',
    name: 'Manager',
    permissions: [authz.roles_view_all],
  },
  {
    id: 'EMPLOYEE',
    name: 'Employee',
    permissions: [authz.roles_view_all],
  },
  {
    id: 'USER',
    name: 'User',
    permissions: [authz.roles_view_all],
  },
]

export const roles = rolesRaw.map((role) => {
  const rolePermissions = permissions
    .filter((p) => p.roles.includes(role.id) || role.id === 'ADMIN')
    .map(({ id }) => id)

  return {
    id: role.id,
    name: role.name,
    requiredPermissions: role.permissions,
    permissions: rolePermissions,
  }
})

export const getViewableRoles = (userPermissions?: Set<Authz>) =>
  roles.filter((role) =>
    role.requiredPermissions.every((permission) =>
      userPermissions?.has(permission),
    ),
  )

export const getViewableUsers = <T extends { roles: Set<Role> }>(
  userPermissions: Set<Authz>,
  users: T[],
) => {
  const viewableRoles = getViewableRoles(userPermissions)

  return users.filter((user) => {
    const userRoles = Array.from(user.roles)

    return userRoles.every((role) =>
      viewableRoles.some((viewableRole) => viewableRole.id === role),
    )
  })
}
