import { authz } from '@dreams-built/shared/src/auth/permissions';
import { type Authz } from '@dreams-built/shared/src/auth/types';
import {
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon
} from '@heroicons/react/20/solid';
import { paths } from 'utils/paths';

export const routes: {
  name: string;
  to: (typeof paths)[keyof typeof paths];
  // - FIXME: need to fix the proper type for icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  requiredPermission?: Authz;
}[] = [
  { name: 'Dashboard', to: paths.dashboard, icon: FolderIcon },
  {
    name: 'Timesheet',
    to: paths.timesheet,
    icon: SignalIcon,
    requiredPermission: authz.timesheet
  },
  {
    name: 'projects',
    to: paths.projects,
    icon: GlobeAltIcon,
    requiredPermission: authz.jobs_read
  },
  {
    name: 'Clients',
    to: paths.clients,
    icon: ServerIcon,
    requiredPermission: authz.clients_read
  },
  // TODO: add permissions
  { name: 'Schedule', to: paths.schedule, icon: GlobeAltIcon },
  {
    name: 'Employees',
    to: paths.employees,
    icon: ServerIcon,
    requiredPermission: authz.roles_view_employee
  },
  // TODO: add permissions
  { name: 'Reports', to: paths.projectReports, icon: SignalIcon }
];
