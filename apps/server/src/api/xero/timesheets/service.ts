import { prisma } from '@config/db';

export const DAY_OFFSETS: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const addDays = (isoDate: string, days: number) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days));

  return date.toISOString().slice(0, 10);
};

export const diffInDays = (laterIso: string, earlierIso: string) => {
  const toUtc = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);

    return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
  };

  return Math.round((toUtc(laterIso) - toUtc(earlierIso)) / (24 * 60 * 60 * 1000));
};

export const roundHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

export type WeekUserHours = {
  userId: string;
  userName: string;
  xeroEmployeeId: string | null;
  hoursByDay: Record<string, number>;
  totalHours: number;
};

// Aggregates a week's TimeEntry minutes into per-day hours per user.
// `duration` is stored in minutes; Xero timesheet lines take hours.
export const getWeekUserHours = async (weekStart: string): Promise<WeekUserHours[]> => {
  const entries = await prisma.timeEntry.findMany({
    where: { weekStart, deleted: false },
    select: {
      day: true,
      duration: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          xeroEmployeeId: true
        }
      }
    }
  });

  const byUser = new Map<string, WeekUserHours & { minutesByDay: Record<string, number> }>();

  for (const entry of entries) {
    const existing = byUser.get(entry.user.id) ?? {
      userId: entry.user.id,
      userName: `${entry.user.firstName} ${entry.user.lastName}`.trim(),
      xeroEmployeeId: entry.user.xeroEmployeeId,
      hoursByDay: {},
      totalHours: 0,
      minutesByDay: {}
    };

    const dayKey = entry.day.trim().toLowerCase();

    if (dayKey in DAY_OFFSETS) {
      existing.minutesByDay[dayKey] = (existing.minutesByDay[dayKey] ?? 0) + entry.duration;
    }

    byUser.set(entry.user.id, existing);
  }

  return [...byUser.values()]
    .map(({ minutesByDay, ...user }) => {
      const hoursByDay: Record<string, number> = {};
      let totalHours = 0;

      for (const dayName of DAY_NAMES) {
        const minutes = minutesByDay[dayName.toLowerCase()] ?? 0;
        const hours = roundHours(minutes);

        if (hours > 0) {
          hoursByDay[dayName] = hours;
          totalHours += hours;
        }
      }

      return { ...user, hoursByDay, totalHours: Math.round(totalHours * 100) / 100 };
    })
    .filter((user) => user.totalHours > 0)
    .sort((a, b) => a.userName.localeCompare(b.userName));
};

export type CalendarInfo = {
  payrollCalendarId: string;
  name: string;
  isWeekly: boolean;
  periodStartDate: string;
};

// MVP supports weekly calendars whose period cycle aligns with the app's
// Monday-start weeks; anything else becomes a per-user blocker.
export const getCalendarBlocker = (
  calendar: CalendarInfo | undefined,
  weekStart: string
): string | null => {
  if (!calendar) {
    return 'The linked Xero employee has no payroll calendar';
  }

  if (!calendar.isWeekly) {
    return `Payroll calendar "${calendar.name}" is not weekly — only weekly calendars are supported`;
  }

  const calendarStart = calendar.periodStartDate.slice(0, 10);

  if (diffInDays(weekStart, calendarStart) % 7 !== 0) {
    return `Payroll calendar "${calendar.name}" runs ${calendarStart.length ? `from ${calendarStart}` : 'on a different cycle'} and does not align with this week`;
  }

  return null;
};
