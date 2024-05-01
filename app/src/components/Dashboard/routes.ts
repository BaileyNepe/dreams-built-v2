import {
  FolderIcon,
  GlobeAltIcon,
  ServerIcon,
  SignalIcon,
} from '@heroicons/react/20/solid'
import { type paths } from 'utils/paths'

export const routes: {
  name: string
  href: (typeof paths)[keyof typeof paths]
  icon: React.ComponentType<React.ComponentProps<'svg'>>
}[] = [
  { name: 'Dashboard', href: '/dashboard', icon: FolderIcon },
  { name: 'Timesheet', href: '/dashboard/timesheet', icon: SignalIcon },
  { name: 'Jobs', href: '/dashboard/jobs', icon: GlobeAltIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: ServerIcon },
  { name: 'Job Parts', href: '/dashboard/job-parts', icon: ServerIcon },
  { name: 'Schedule', href: '/dashboard/schedule', icon: GlobeAltIcon },
  { name: 'Employees', href: '/dashboard/employees', icon: ServerIcon },
  { name: 'Job Reports', href: '/dashboard/job-reports', icon: SignalIcon },
  {
    name: 'Timesheet Reports',
    href: '/dashboard/timesheet-reports',
    icon: SignalIcon,
  },
]
