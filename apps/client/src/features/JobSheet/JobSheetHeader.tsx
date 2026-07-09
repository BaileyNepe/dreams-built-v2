import { computeFloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { Box, Typography } from '@mui/material';
import { useClient } from 'api/clients';
import { useProject } from 'api/projects';
import { useMemo, type FC } from 'react';
import { useJobSheetContext } from './state/JobSheetProvider';

/** The job line exactly as it appears on the paper sheet, plus live totals. */
export const JobSheetHeader: FC = () => {
  const { projectId, computed, data, rules } = useJobSheetContext();
  const project = useProject(projectId);
  const client = useClient(project.clientId);

  // Slab area only exists once the perimeter closes into a polygon.
  const areaM2 = useMemo(() => {
    if (data.mode === 'manual') return null;
    return computeFloorOutline(data, computed, rules).areaM2;
  }, [data, computed, rules]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="h5" component="h1">
        {client.name} - {project.address}, {project.city} - Job #{' '}
        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>
          {project.jobNumber}
        </Box>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {data.system} · {computed.walls.length} walls · perimeter{' '}
        {computed.perimeterMm.toLocaleString()}mm
        {areaM2 !== null &&
          ` · area ${areaM2.toLocaleString(undefined, { maximumFractionDigits: 1 })}m²`}
      </Typography>
    </Box>
  );
};
