export const paths = {
  home: '/',
  timesheet: '/timesheet',
  clients: {
    root: '/clients',
    create: '/clients/create',
    edit: (id: string) => `/clients/${id}/edit`,
  },
  contractors: {
    root: '/contractors',
    create: '/contractors/create',
    edit: (id: string) => `/contractors/edit/${id}`,
  },
  jobs: {
    root: '/jobs',
    create: '/jobs/create',
    edit: (id: string) => `/jobs/details/${id}`,
  },
  jobparts: {
    root: '/jobparts',
    create: '/jobparts/create',
    edit: (id: string) => `/jobparts/edit/${id}`,
  },
  employees: {
    root: '/employees',
    edit: (id: string) => `/employees/edit/${id}`,
  },
  schedule: {
    root: '/schedule',
  },
  profile: {
    root: '/profile',
  },
  healthAndSafety: {
    root: '/health-and-safety',
  },
  reports: {
    timesheets: '/reports/timesheets/employees',
    jobs: '/reports/timesheets/jobs',
  },
  logout: '/api/auth/logout',
  login: '/api/auth/login',
};
