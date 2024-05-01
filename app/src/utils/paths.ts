export const paths = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  dashboard: '/dashboard',
  home: '/',
  clients: '/dashboard/clients',
  employees: '/dashboard/employees',
  jobs: '/dashboard/jobs',
  schedule: '/dashboard/schedule',
  timesheet: '/dashboard/timesheet',

  clientCreate: '/dashboard/clients/create',
  clientEdit: (id: string) => `/dashboard/clients/${id}/edit`,
} as const
