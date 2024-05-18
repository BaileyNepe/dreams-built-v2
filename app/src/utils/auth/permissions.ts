/* eslint-disable camelcase */
import { type Permission, type Role } from './types'

export const authz = {
  roles_view_all: 'users:view:all',
  roles_view_employee: 'users:view:employee',

  clients_read: 'clients:read',

  timesheet: 'timesheet:view:self',
  timesheet_view_all: 'timesheet:view:all',
} as const

const rolesPermissions: Permission = [
  {
    id: authz.roles_view_all,
    name: 'Roles View All',
    roles: [],
  },
]

const clientPermissions: Permission = [
  {
    id: authz.clients_read,
    name: 'Clients Read',
    roles: ['EMPLOYEE', 'MANAGER'],
  },
]

const timesheetPermissions: Permission = [
  {
    id: authz.timesheet,
    name: 'Timesheet',
    roles: ['EMPLOYEE', 'MANAGER'],
  },
  {
    id: authz.timesheet_view_all,
    name: 'Timesheet View All',
    roles: ['MANAGER', 'ADMIN'],
  },
]

export const permissions: Permission = [
  ...rolesPermissions,
  ...clientPermissions,
  ...timesheetPermissions,
]

export const getViewablePermissions = (role?: Set<Role>) =>
  permissions.filter((p) =>
    p.roles.some((r) => role?.has(r) || role?.has('ADMIN')),
  )
