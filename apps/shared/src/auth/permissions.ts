/* eslint-disable camelcase */
import { type Permission, type Role } from './types';

export const authz = {
  roles_view_all: 'users:view:all',
  roles_view_employee: 'users:view:employee',

  roles_update_user: 'users:update:user',

  clients_read: 'clients:read',
  clients_edit: 'clients:edit',

  timesheet: 'timesheet:view:self',
  timesheet_view_all: 'timesheet:view:all',

  jobs_read: 'jobs:read',
  jobs_edit: 'jobs:edit',

  jobsheets_edit: 'jobsheets:edit',

  schedule_read: 'schedule:read',
  schedule_edit: 'schedule:edit',

  messages_read: 'messages:read',

  upload: 'upload',

  // Forum permissions
  forum_create_post: 'forum:create:post',
  forum_update_post: 'forum:update:post',
  forum_delete_post: 'forum:delete:post',
  forum_view_posts: 'forum:view:posts',
  forum_create_comment: 'forum:create:comment',
  forum_update_comment: 'forum:update:comment',
  forum_delete_comment: 'forum:delete:comment',
  forum_view_comments: 'forum:view:comments',
  forum_like_post: 'forum:like:post',
  forum_unlike_post: 'forum:unlike:post',
  forum_create_attachment: 'forum:create:attachment'
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
  },
  {
    id: authz.roles_update_user,
    name: 'Roles Update User',
    roles: ['ADMIN', 'MANAGER']
  },
  {
    id: authz.messages_read,
    name: 'Messages Read',
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
    roles: ['EMPLOYEE', 'MANAGER', 'CONTRACTOR']
  },
  {
    id: authz.jobs_edit,
    name: 'Jobs Edit',
    roles: ['MANAGER']
  },
  {
    id: authz.jobsheets_edit,
    name: 'Job Sheets Edit',
    roles: ['EMPLOYEE', 'MANAGER']
  },
  { id: authz.upload, name: 'Upload', roles: ['EMPLOYEE', 'MANAGER', 'CONTRACTOR'] },
  {
    id: authz.schedule_read,
    name: 'Schedule Read',
    roles: ['EMPLOYEE', 'MANAGER', 'CONTRACTOR']
  },
  {
    id: authz.schedule_edit,
    name: 'Schedule Edit',
    roles: ['MANAGER']
  }
];

const forumPermissions: Permission = [
  {
    id: authz.forum_create_post,
    name: 'Create Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_update_post,
    name: 'Update Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_delete_post,
    name: 'Delete Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_view_posts,
    name: 'View Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_create_comment,
    name: 'Create Forum Comments',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_update_comment,
    name: 'Update Forum Comments',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_delete_comment,
    name: 'Delete Forum Comments',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_view_comments,
    name: 'View Forum Comments',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_like_post,
    name: 'Like Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_unlike_post,
    name: 'Unlike Forum Posts',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  },
  {
    id: authz.forum_create_attachment,
    name: 'Create Forum Attachments',
    roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'CONTRACTOR']
  }
];

export const permissions: Permission = [
  ...rolesPermissions,
  ...clientPermissions,
  ...timesheetPermissions,
  ...jobsPermissions,
  ...forumPermissions
];

export const getViewablePermissions = (role?: Set<Role>) =>
  permissions.filter((p) => p.roles.some((r) => role?.has(r) || role?.has('ADMIN')));
