export const paths = {
  dashboard: '/dashboard',
  home: '/',

  clients: '/dashboard/clients',
  clientCreate: '/dashboard/clients/create',
  clientEdit: '/dashboard/clients/edit/$clientId',

  projects: '/dashboard/projects',
  projectsCreate: '/dashboard/projects/create',
  projectsEdit: '/dashboard/projects/edit/$projectId',
  projectDetail: '/dashboard/projects/detail/$projectId',
  projectJobSheet: '/dashboard/projects/jobsheet/$projectId',

  projectParts: '/dashboard/project-parts',

  projectReports: '/dashboard/reports',
  timesheetReports: '/dashboard/reports',

  employees: '/dashboard/employees',
  employeeEdit: '/dashboard/employees/$employeeId',

  schedule: '/dashboard/schedule',

  timesheet: '/dashboard/timesheet',

  messages: '/dashboard/messages',

  logout: '/logout',

  contact: '/contact',
  about: '/about',
  services: '/services'
} as const;
