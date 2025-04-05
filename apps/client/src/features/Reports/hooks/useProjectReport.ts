import { useReportData } from 'api/reports';
import { getDayOrder } from 'utils/date';

export const useProjectReport = (week: string) => {
  const { entries } = useReportData(week);

  // Group entries by job number
  const jobsMap = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.jobNumber]) {
        acc[entry.jobNumber] = {
          jobNumber: entry.jobNumber,
          projectAddress: entry.projectAddress,
          clientName: entry.clientName,
          entries: [] as typeof entries
        };
      }
      acc[entry.jobNumber].entries.push(entry);
      return acc;
    },
    {} as Record<
      number,
      {
        jobNumber: number;
        projectAddress: string;
        clientName: string;
        entries: typeof entries;
      }
    >
  );

  const projects = Object.values(jobsMap).map((project) => {
    // Sort entries within each project by day and then by startTime.
    project.entries.sort((a, b) => {
      const dayDiff = getDayOrder(a.day) - getDayOrder(b.day);
      return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
    });

    // Group entries by user
    const userMap = project.entries.reduce(
      (acc, entry) => {
        if (!acc[entry.userId]) {
          acc[entry.userId] = {
            userName: entry.userName,
            hourlyRate: entry.hourlyRate,
            totalMinutes: 0
          };
        }
        acc[entry.userId].totalMinutes += entry.duration;
        return acc;
      },
      {} as Record<
        string,
        { userName: string; hourlyRate?: number; totalMinutes: number }
      >
    );

    // Create table rows from the user groups.
    const rows = Object.entries(userMap).map(([userId, userData]) => {
      const hours = userData.totalMinutes / 60;
      const cost = userData.hourlyRate ? userData.hourlyRate * hours : 0;

      return {
        id: userId,
        employee: userData.userName,
        rate: userData.hourlyRate ? `$${userData.hourlyRate.toFixed(2)}` : '$0.00',
        hours: hours.toFixed(2),
        cost: `$${cost.toFixed(2)}`
      };
    });

    // Calculate totals for the project.
    const totalHours = rows.reduce((acc, row) => acc + parseFloat(row.hours), 0);
    const totalCost = rows.reduce((acc, row) => {
      const costVal = parseFloat(row.cost.replace('$', ''));
      return acc + (isNaN(costVal) ? 0 : costVal);
    }, 0);

    return {
      ...project,
      rows,
      totalHours,
      totalCost
    };
  });

  projects.sort((a, b) => a.jobNumber - b.jobNumber);
  return projects;
};
