import { notify } from 'libs/Notify';
import { api } from './trpc';

export const useJobSheet = (projectId: string) =>
  api.jobSheets.getByProject.useSuspenseQuery({ projectId })[0];

export const useCreateJobSheetMutation = () => {
  const utils = api.useUtils();
  return api.jobSheets.create.useMutation({
    onSettled: (_data, _error, variables) => {
      utils.jobSheets.getByProject.invalidate({ projectId: variables.projectId });
    }
  });
};

/**
 * Autosave mutation: silent on success (a toolbar chip shows the state);
 * conflicts and failures are surfaced by the autosave hook, not here.
 */
export const useSaveJobSheetMutation = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.save.useMutation({
    // Mirror the accepted document into the getByProject cache. Without
    // this, re-entering the sheet within staleTime mounts the editor from
    // the pre-edit cache entry (walls without their measurements). A
    // mutation-level onSuccess still runs for the flush save fired while
    // the editor unmounts, unlike callbacks passed to mutate().
    onSuccess: (result, variables) => {
      utils.jobSheets.getByProject.setData({ projectId }, (previous) =>
        previous && previous.id === variables.sheetId
          ? { ...previous, data: variables.data, revision: result.revision }
          : previous
      );
    }
  });
};

export const useRemoveJobSheetMutation = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.remove.useMutation({
    onSuccess: () => {
      notify('Job sheet deleted', { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheets.getByProject.invalidate({ projectId });
    }
  });
};

export const useRefreshRulesMutation = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.refreshRules.useMutation({
    onSuccess: () => {
      notify('Sheet rules reset to the shared defaults', { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheets.getByProject.invalidate({ projectId });
    }
  });
};

/**
 * Per-sheet rules edit: only this sheet changes; the shared defaults that
 * seed new sheets are never touched from here.
 */
export const useUpdateSheetRulesMutation = ({ projectId }: { projectId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.updateSheetRules.useMutation({
    onSuccess: () => {
      notify('Rules updated for this sheet', { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheets.getByProject.invalidate({ projectId });
    }
  });
};

/* ------------------------------------------------------------------ */
/* Snapshots                                                            */
/* ------------------------------------------------------------------ */

export const useSnapshots = (sheetId: string, options?: { enabled?: boolean }) =>
  api.jobSheets.listSnapshots.useQuery({ sheetId }, { enabled: options?.enabled });

export const useSnapshot = (snapshotId: string | null) =>
  api.jobSheets.getSnapshot.useQuery(
    { snapshotId: snapshotId ?? '' },
    { enabled: snapshotId !== null }
  );

export const useCreateSnapshotMutation = ({ sheetId }: { sheetId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.createSnapshot.useMutation({
    onSuccess: (snapshot) => {
      notify(`Snapshot v${snapshot.version} saved`, { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheets.listSnapshots.invalidate({ sheetId });
    }
  });
};

/**
 * Print/export record: snapshots only when the sheet changed since the
 * last snapshot. Silent — the user asked to print, not to manage versions.
 */
export const useSnapshotIfChangedMutation = ({ sheetId }: { sheetId: string }) => {
  const utils = api.useUtils();
  return api.jobSheets.snapshotIfChanged.useMutation({
    onSuccess: (result) => {
      if (result.created) utils.jobSheets.listSnapshots.invalidate({ sheetId });
    }
  });
};

export const useRestoreSnapshotMutation = ({
  sheetId,
  projectId
}: {
  sheetId: string;
  projectId: string;
}) => {
  const utils = api.useUtils();
  return api.jobSheets.restoreSnapshot.useMutation({
    onSuccess: () => {
      notify('Snapshot restored', { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheets.listSnapshots.invalidate({ sheetId });
      utils.jobSheets.getByProject.invalidate({ projectId });
    }
  });
};

