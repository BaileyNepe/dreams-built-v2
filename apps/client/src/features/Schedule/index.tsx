import { Box } from '@mui/material';
import { useSchedule } from 'api/schedule';
import { type DateTime } from 'luxon';
import React, { type FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { formatDate, getDate } from 'utils/date';
import { BlockDaysOverlay } from './BlockDaysOverlay';
import { ScheduleHeader } from './ScheduleHeader';
import { type LaneTask, type Task } from './types';

const assignTaskLanes = (tasks: Task[]) => {
  const sorted = tasks.slice().sort((a, b) => a.start.toMillis() - b.start.toMillis());
  const laneEndTimes: DateTime[] = [];
  const result: LaneTask[] = [];
  for (const t of sorted) {
    let laneIndex = 0;
    while (
      laneIndex < laneEndTimes.length &&
      t.start.toMillis() <= laneEndTimes[laneIndex].toMillis()
    ) {
      laneIndex++;
    }
    if (laneIndex >= laneEndTimes.length) {
      laneEndTimes.push(t.end);
    } else {
      laneEndTimes[laneIndex] = t.end;
    }
    result.push({ ...t, lane: laneIndex });
  }
  return result;
};

const Container = styled(Box)`
  padding: 1rem;
`;

const JobPartCell = styled(Box)`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  display: flex;
  padding: 0.5rem;
`;

const ScheduleRow = styled(Box)<{ $minHeight: string }>`
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[300]};
  min-height: ${({ $minHeight: minHeight }) => minHeight};
  position: relative;
`;

// ----- Main Component using Luxon for all date logic -----
export const Schedule: FC = () => {
  const [selectedDate] = useState(getDate());
  const startOfWeek = useMemo(() => selectedDate.startOf('week'), [selectedDate]);
  const endOfWeek = useMemo(() => selectedDate.endOf('week'), [selectedDate]);

  const schedule = useSchedule(formatDate(startOfWeek), formatDate(endOfWeek));

  const datesToShow = useMemo(() => {
    const result: DateTime[] = [];
    let iterDate = startOfWeek;
    while (iterDate <= endOfWeek) {
      result.push(iterDate);
      iterDate = iterDate.plus({ days: 1 });
    }
    return result;
  }, [startOfWeek, endOfWeek]);

  const jobPartsWithDates = useMemo(
    () =>
      schedule.map((jp) => {
        const tasks = jp.projectSchedule.map((t) => ({
          ...t,
          start: getDate(t.startDate),
          end: getDate(t.endDate)
        }));
        return { ...jp, tasks: assignTaskLanes(tasks) };
      }),
    [schedule]
  );

  return (
    <Container>
      <ScheduleHeader datesToShow={datesToShow} />

      <Box display="grid" gridTemplateColumns="200px 1fr">
        {jobPartsWithDates.map((jp) => {
          const maxLane = Math.max(...jp.tasks.map((t) => t.lane), 0);
          const rowHeight = (maxLane + 1) * 30 + 20;
          return (
            <React.Fragment key={jp.id}>
              <JobPartCell height={`${rowHeight}px`}>{jp.name}</JobPartCell>
              <ScheduleRow $minHeight={`${rowHeight}px`}>
                <BlockDaysOverlay datesToShow={datesToShow} />
              </ScheduleRow>
            </React.Fragment>
          );
        })}
      </Box>
    </Container>
  );
};
