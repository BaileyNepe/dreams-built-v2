export const paths = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  dashboard: '/dashboard',
  home: '/',

  clients: '/dashboard/clients',
  clientCreate: '/dashboard/clients/create',
  clientEdit: (id: string) => `/dashboard/clients/${id}`,

  jobs: '/dashboard/jobs',
  jobsCreate: '/dashboard/jobs/create',
  jobsEdit: (id: string) => `/dashboard/jobs/${id}`,

  jobParts: '/dashboard/job-parts',
  jobPartsCreate: '/dashboard/job-parts/create',
  jobPartsEdit: (id: string) => `/dashboard/job-parts/${id}`,

  jobReports: '/dashboard/job-reports',
  timesheetReports: '/dashboard/timesheet-reports',

  employeeCreate: '/dashboard/employees/create',
  employees: '/dashboard/employees',
  employeeEdit: (id: string) => `/dashboard/employees/${id}`,

  schedule: '/dashboard/schedule',

  timesheet: '/dashboard/timesheet',
} as const
