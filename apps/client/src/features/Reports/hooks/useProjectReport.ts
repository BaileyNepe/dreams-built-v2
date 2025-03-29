import { useReportData } from 'api/reports';
import { getDayOrder } from 'utils/date';

export const useJobNumberReport = (week: string) => {
  const { entries } = useReportData(week);

  const jobReportMap: Record<number, { entries: (typeof entries)[number][] }> = {};

  for (const entry of entries) {
    const { jobNumber } = entry;
    if (!jobReportMap[jobNumber]) {
      jobReportMap[jobNumber] = { entries: [] };
    }
    jobReportMap[jobNumber].entries.push(entry);
  }

  Object.values(jobReportMap).forEach((group) => {
    group.entries.sort((a, b) => {
      const dayDiff = getDayOrder(a.day) - getDayOrder(b.day);
      return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
    });
  });

  const report = Object.entries(jobReportMap).map(([jobNumberStr, group]) => {
    const jobNumber = Number(jobNumberStr);

    return {
      jobNumber,
      projectAddress: group.entries[0]?.projectAddress,
      clientName: group.entries[0]?.clientName,
      entries: group.entries
    };
  });

  report.sort((a, b) => a.jobNumber - b.jobNumber);

  return report;
};
