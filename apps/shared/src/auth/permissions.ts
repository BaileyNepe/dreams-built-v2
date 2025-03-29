/* eslint-disable camelcase */
import { type Permission, type Role } from './types';

export const authz = {
  roles_view_all: 'users:view:all',
  roles_view_employee: 'users:view:employee',

  clients_read: 'clients:read',
  clients_edit: 'clients:edit',

  timesheet: 'timesheet:view:self',
  timesheet_view_all: 'timesheet:view:all',

  jobs_read: 'jobs:read',
  jobs_edit: 'jobs:edit',

  schedule_read: 'schedule:read',
  schedule_edit: 'schedule:edit'
} as const;

const rolesPermissions: Permission = [
  {
    id: authz.roles_view_all,
    name: 'Roles View All',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    id: authz.roles_view_employee,
    name: 'Roles View Employee',
    roles: ['ADMIN', 'MANAGER']
  }
];

const clientPermissions: Permission = [
  {
    id: authz.clients_read,
    name: 'Clients Read',
    roles: ['EMPLOYEE', 'MANAGER']
  },
  {
    id: authz.clients_edit,
    name: 'Clients Edit',
    roles: ['MANAGER']
  }
];

const timesheetPermissions: Permission = [
  {
    id: authz.timesheet,
    name: 'Timesheet',
    roles: ['EMPLOYEE', 'MANAGER']
  },
  {
    id: authz.timesheet_view_all,
    name: 'Timesheet View All',
    roles: ['MANAGER']
  }
];

const jobsPermissions: Permission = [
  {
    id: authz.jobs_read,
    name: 'Jobs Read',
    roles: ['EMPLOYEE', 'MANAGER']
  },
  {
    id: authz.jobs_edit,
    name: 'Jobs Edit',
    roles: ['MANAGER']
  },
  {
    id: authz.schedule_read,
    name: 'Schedule Read',
    roles: ['EMPLOYEE', 'MANAGER']
  },
  {
    id: authz.schedule_edit,
    name: 'Schedule Edit',
    roles: ['MANAGER']
  }
];

export const permissions: Permission = [
  ...rolesPermissions,
  ...clientPermissions,
  ...timesheetPermissions,
  ...jobsPermissions
];

export const getViewablePermissions = (role?: Set<Role>) =>
  permissions.filter((p) => p.roles.some((r) => role?.has(r) || role?.has('ADMIN')));
