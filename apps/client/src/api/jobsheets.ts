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
      notify('Sheet updated to the latest rules', { type: 'success' });
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

/* ------------------------------------------------------------------ */
/* Rules                                                                */
/* ------------------------------------------------------------------ */

export const useActiveRules = () => api.jobSheetRules.getActive.useSuspenseQuery()[0];

/** Non-suspense variant for passive UI like the "rules changed" hint. */
export const useActiveRulesQuery = () => api.jobSheetRules.getActive.useQuery();

export const useUpdateRulesMutation = () => {
  const utils = api.useUtils();
  return api.jobSheetRules.update.useMutation({
    onSuccess: () => {
      notify('Rules updated — new sheets will use them', { type: 'success' });
    },
    onSettled: () => {
      utils.jobSheetRules.getActive.invalidate();
    }
  });
};
