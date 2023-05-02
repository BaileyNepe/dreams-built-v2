import { paths } from '@/components/utils/paths';
import { AiFillHome, AiOutlineCalendar } from 'react-icons/ai';
import { CgFileDocument, CgProfile } from 'react-icons/cg';
import { MdBusiness, MdLogout, MdOutlineEditCalendar, MdOutlinePeopleAlt, MdOutlineWorkOutline } from 'react-icons/md';
import { RiArrowDownSFill, RiArrowUpSFill } from 'react-icons/ri';
import { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: paths.home,
    icon: <AiFillHome />,
    roles: ['user', 'admin', 'employee'],
  },
  {
    title: 'Timesheet',
    path: paths.timesheet,
    icon: <MdOutlineEditCalendar />,
    roles: ['admin', 'employee'],
  },
  {
    title: 'Companies',
    icon: <MdBusiness />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    roles: ['admin'],
    subNav: [
      {
        title: 'Clients',
        path: paths.clients.root,
        roles: ['admin'],
      },
      {
        title: 'Contractors',
        path: paths.contractors.root,
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Jobs',
    icon: <MdOutlineWorkOutline />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    roles: ['admin', 'employee'],
    subNav: [
      {
        title: 'Job List',
        path: paths.jobs.root,
        roles: ['employee', 'admin'],
      },
      {
        title: 'Job Parts',
        path: paths.jobparts.root,
        roles: ['admin'],
      },
    ],
  },

  {
    title: 'Schedule',
    path: paths.schedule.root,
    icon: <AiOutlineCalendar />,
    roles: ['admin', 'employee'],
  },
  {
    title: 'Employees',
    path: paths.employees.root,
    icon: <MdOutlinePeopleAlt />,
    roles: ['admin'],
  },
  {
    title: 'Reports',
    icon: <CgFileDocument />,
    iconClosed: <RiArrowDownSFill />,
    iconOpened: <RiArrowUpSFill />,
    roles: ['admin'],
    subNav: [
      {
        title: 'Timesheets',
        path: paths.reports.timesheets,
        roles: ['admin'],
      },
      {
        title: 'Labour Expenses',
        path: paths.reports.jobs,
        roles: ['admin'],
      },
    ],
  },
  {
    title: 'Profile',
    path: paths.profile.root,
    icon: <CgProfile />,
    roles: ['user', 'admin', 'employee'],
  },
  {
    title: 'Health & Safety',
    path: paths.healthAndSafety.root,
    icon: <CgFileDocument />,
    roles: ['admin', 'employee'],
  },
  {
    title: 'Logout',
    icon: <MdLogout />,
    path: paths.logout,
    roles: ['user', 'admin', 'employee'],
  },
];
