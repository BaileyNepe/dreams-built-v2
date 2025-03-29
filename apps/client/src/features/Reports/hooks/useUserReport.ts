import { useReportData } from 'api/reports';
import { getDayOrder } from 'utils/date';

export const useUsersReport = (week: string) => {
  const { entries, notes, usersWithNoEntries } = useReportData(week);

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
    return { userId, userName, email, entries: group.entries, notes: group.notes };
  });

  report.sort((a, b) => a.userName.localeCompare(b.userName));

  return { users: report, usersWithNoEntries };
};
