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
  { name: 'Timesheet', to: paths.timesheet, icon: SignalIcon },
  { name: 'projects', to: paths.projects, icon: GlobeAltIcon },
  {
    name: 'Clients',
    to: paths.clients,
    icon: ServerIcon,
    requiredPermission: authz.clients_read
  },
  { name: 'project Parts', to: paths.projectParts, icon: ServerIcon },
  { name: 'Schedule', to: paths.schedule, icon: GlobeAltIcon },
  {
    name: 'Employees',
    to: paths.employees,
    icon: ServerIcon,
    requiredPermission: authz.roles_view_employee
  },
  { name: 'Reports', to: paths.projectReports, icon: SignalIcon }
];
