import { type RoutePaths } from '@tanstack/react-router';
import { type routeTree } from 'routeTree.gen';

export type Routes = RoutePaths<typeof routeTree>;

export const paths: Record<string, Routes> = {
  dashboard: '/dashboard',
  home: '/',

  clients: '/dashboard/clients',
  clientCreate: '/dashboard/clients/create',
  clientEdit: '/dashboard/clients/$clientId',

  projects: '/dashboard/projects',
  projectsCreate: '/dashboard/projects/create',
  projectsEdit: '/dashboard/projects/$projectId',

  projectParts: '/dashboard/project-parts',

  projectReports: '/dashboard/reports',
  timesheetReports: '/dashboard/reports',

  employees: '/dashboard/employees',
  employeeEdit: '/dashboard/employees/$employeeId',

  schedule: '/dashboard/schedule',

  timesheet: '/dashboard/timesheet'
} as const;
