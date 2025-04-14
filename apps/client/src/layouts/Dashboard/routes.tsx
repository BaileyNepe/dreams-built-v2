import { authz } from '@dreams-built/shared/src/auth/permissions';
import { type Authz } from '@dreams-built/shared/src/auth/types';
import {
  ArrowRightStartOnRectangleIcon,
  CalendarIcon,
  FolderIcon,
  GlobeAltIcon,
  InboxIcon,
  ServerIcon,
  SignalIcon,
  UsersIcon
} from '@heroicons/react/20/solid';
import { type LinkOptions } from '@tanstack/react-router';
import { type ForwardRefExoticComponent } from 'react';
import { paths } from 'utils/paths';

export const routes: {
  name: string;
  to: LinkOptions['to'];
  icon: ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
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
  {
    name: 'Employees',
    to: paths.employees,
    icon: UsersIcon,
    requiredPermission: authz.roles_view_employee
  },
  {
    name: 'Schedule',
    to: paths.schedule,
    icon: CalendarIcon,
    requiredPermission: authz.jobs_read
  },
  {
    name: 'Reports',
    to: paths.projectReports,
    icon: SignalIcon,
    requiredPermission: authz.timesheet_view_all
  },
  {
    name: 'Messages',
    to: paths.messages,
    icon: InboxIcon,
    requiredPermission: authz.messages_read
  },
  {
    name: 'Logout',
    to: paths.logout,
    icon: ArrowRightStartOnRectangleIcon
  }
];
