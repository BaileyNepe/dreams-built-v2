import { Permission, Role } from './types'

export const authz = {
  roles_view_all: 'users:view:all',
  roles_view_employee: 'users:view:employee',

  clients_read: 'clients:read',
} as const

const rolesPermissions: Permission = [
  {
    id: authz.roles_view_all,
    name: 'Roles View All',
    roles: [],
  },
]

export const permissions: Permission = [...rolesPermissions]

export const getViewablePermissions = (role?: Set<Role>) =>
  permissions.filter((p) =>
    p.roles.some((r) => role?.has(r) || role?.has('ADMIN')),
  )
