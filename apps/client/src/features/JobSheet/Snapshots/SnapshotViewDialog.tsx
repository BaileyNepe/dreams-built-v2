import { computeJobSheet } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import { snapshotBlobSchema } from '@dreams-built/shared/src/jobsheet/types';
import { Skeleton, Typography } from '@mui/material';
import { useSnapshot } from 'api/jobsheets';
import { useClient } from 'api/clients';
import { useProject } from 'api/projects';
import BasicModal from 'components/Modal';
import { useMemo, type FC } from 'react';
import { SheetView } from '../SheetView';
import { useJobSheetContext } from '../state/JobSheetProvider';

/** Read-only render of a stored snapshot, in the paper-sheet layout. */
export const SnapshotViewDialog: FC<{
  snapshotId: string | null;
  onClose: () => void;
}> = ({ snapshotId, onClose }) => {
  const { projectId } = useJobSheetContext();
  const project = useProject(projectId);
  const client = useClient(project.clientId);
  const snapshot = useSnapshot(snapshotId);

  const blob = useMemo(() => {
    if (!snapshot.data) return null;
    const parsed = snapshotBlobSchema.parse(snapshot.data.blob);
    // Recompute for display: deterministic given data + rules, and typed.
    return { ...parsed, computed: computeJobSheet(parsed.data, parsed.rules) };
  }, [snapshot.data]);

  return (
    <BasicModal
      open={snapshotId !== null}
      onClose={onClose}
      title={
        snapshot.data
          ? `Snapshot v${snapshot.data.version}${
              snapshot.data.label ? ` — ${snapshot.data.label}` : ''
            }`
          : 'Snapshot'
      }
      width="60rem"
    >
      {blob ? (
        <>
          <Typography variant="caption" color="text.secondary">
            Saved {new Date(snapshot.data!.createdAt).toLocaleString()}
            {snapshot.data!.createdBy &&
              ` by ${snapshot.data!.createdBy.firstName} ${snapshot.data!.createdBy.lastName}`}
          </Typography>
          <SheetView
            headerText={`${client.name} - ${project.address}, ${project.city}`}
            jobNumber={project.jobNumber}
            data={blob.data}
            rules={blob.rules}
            computed={blob.computed}
          />
        </>
      ) : (
        <Skeleton variant="rectangular" height={300} />
      )}
    </BasicModal>
  );
};
