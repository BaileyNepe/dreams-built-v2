import { useReportData } from 'api/reports';
import { useUsers } from 'api/user';
import { getDayOrder } from 'utils/date';

export const useUsersReport = (week: string) => {
  const { entries, notes, usersWithNoEntries } = useReportData(week);
  const users = useUsers({ showAll: true });

  // Group data by userId. Types are inferred inline.
  const userReportMap: Record<
    string,
    {
      entries: (typeof entries)[number][];
      notes: (typeof notes)[number][];
      userDetails?: { userId: string; userName: string; email?: string };
    }
  > = {};

  const getGroup = (uid: string) => {
    if (!userReportMap[uid]) {
      userReportMap[uid] = { entries: [], notes: [] };
    }
    return userReportMap[uid];
  };

  for (const entry of entries) {
    getGroup(entry.userId).entries.push(entry);
  }

  for (const note of notes) {
    getGroup(note.userId).notes.push(note);
  }

  Object.values(userReportMap).forEach((group) => {
    group.entries.sort((a, b) => {
      const dayDiff = getDayOrder(a.day) - getDayOrder(b.day);
      return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
    });
    group.notes.sort((a, b) => getDayOrder(a.day) - getDayOrder(b.day));
  });

  const report = Object.entries(userReportMap).map(([userId, group]) => {
    const userName = group.userDetails?.userName || group.entries[0]?.userName || '';
    const email = group.userDetails?.email || '';

    const totalMinutes = group.entries.reduce((acc, entry) => acc + entry.duration, 0);

    return {
      userId,
      userName,
      email,
      entries: group.entries,
      notes: group.notes,
      // show total hours in 2 decimal format
      totalHours: `${(totalMinutes / 60).toFixed(2)}`
    };
  });

  report.sort((a, b) => a.userName.localeCompare(b.userName));

  report.forEach((user) => {
    // if no user.userName try to find it based on the id
    if (!user.userName) {
      const userDetails = users.data?.find((u) => u.id === user.userId);
      if (userDetails) {
        user.userName =
          `${userDetails.firstName} ${userDetails.lastName}`.trim() ?? user.userId;
      }
    }
  });

  return { users: report, usersWithNoEntries };
};

export type Entry = ReturnType<typeof useUsersReport>['users'][number]['entries'][number];
export type UsersWithNoEntries = ReturnType<typeof useUsersReport>['usersWithNoEntries'];
