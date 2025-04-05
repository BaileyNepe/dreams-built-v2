import { z } from 'zod';

const AuthzSchema = z.enum([
  'clients:read',
  'clients:edit',
  'users:view:all',
  'users:view:employee',
  'users:update:user',
  'timesheet:view:self',
  'timesheet:view:all',
  'jobs:read',
  'jobs:edit',
  'schedule:read',
  'schedule:edit'
]);

export const RoleSchema = z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']);

export const RolesSchema = z.array(
  z.object({
    id: RoleSchema,
    name: z.string(),
    permissions: z.array(AuthzSchema)
  })
);

const PermissionSchema = z.array(
  z.object({
    id: AuthzSchema,
    name: z.string(),
    roles: z.array(RoleSchema)
  })
);

export type Authz = z.infer<typeof AuthzSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Roles = z.infer<typeof RolesSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
