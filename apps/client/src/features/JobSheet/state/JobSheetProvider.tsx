import { computeJobSheet } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import {
  jobSheetDataSchema,
  jobSheetRulesSchema,
  type ComputedSheet,
  type JobSheetData,
  type JobSheetRules
} from '@dreams-built/shared/src/jobsheet/types';
import { notify } from 'libs/Notify';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren
} from 'react';
import { readDraft } from './draftStorage';
import { jobSheetReducer, type JobSheetAction } from './jobSheetReducer';
import { useAutosave, type SaveStatus } from './useAutosave';

/** The sheet row as served by jobSheets.getByProject / restoreSnapshot. */
export type ServerSheet = {
  id: string;
  data: unknown;
  rules: unknown;
  revision: number;
};

type JobSheetContextValue = {
  sheetId: string;
  projectId: string;
  data: JobSheetData;
  rules: JobSheetRules;
  computed: ComputedSheet;
  dispatch: Dispatch<JobSheetAction>;
  canEdit: boolean;
  saveStatus: SaveStatus;
  retrySave: () => void;
  /**
   * Adopt a sheet state the server just produced (snapshot restore, rules
   * refresh) without remounting the editor.
   */
  applyServerSheet: (sheet: ServerSheet) => void;
};

const JobSheetContext = createContext<JobSheetContextValue | null>(null);

export const useJobSheetContext = (): JobSheetContextValue => {
  const context = useContext(JobSheetContext);
  if (!context) {
    throw new Error('useJobSheetContext must be used inside JobSheetProvider');
  }
  return context;
};

export const JobSheetProvider: FC<
  PropsWithChildren<{
    sheet: ServerSheet;
    projectId: string;
    canEdit: boolean;
  }>
> = ({ sheet, projectId, canEdit, children }) => {
  // Zod-parse the Json documents: acts as a lenient migration layer, so a
  // sheet saved before a schema gained a defaulted field still loads. An
  // unsaved local draft (edits made during an internet outage, then a
  // refresh) takes precedence when it was based on the server's current
  // revision — it is strictly newer work from this device.
  const [initial] = useState(() => {
    const serverData = jobSheetDataSchema.parse(sheet.data);
    const draft = canEdit ? readDraft(sheet.id) : null;
    if (
      draft &&
      draft.revision === sheet.revision &&
      JSON.stringify(draft.data) !== JSON.stringify(serverData)
    ) {
      return { data: draft.data, fromDraft: true };
    }
    return { data: serverData, fromDraft: false };
  });

  const [data, dispatch] = useReducer(jobSheetReducer, initial.data);
  const [rules, setRules] = useState<JobSheetRules>(() =>
    jobSheetRulesSchema.parse(sheet.rules)
  );

  useEffect(() => {
    if (initial.fromDraft) {
      notify('Restored unsaved changes from this device', { type: 'info' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => computeJobSheet(data, rules), [data, rules]);

  const { status, retry, setRevision } = useAutosave({
    sheetId: sheet.id,
    initialRevision: sheet.revision,
    data,
    enabled: canEdit,
    initialDirty: initial.fromDraft
  });

  const value = useMemo<JobSheetContextValue>(
    () => ({
      sheetId: sheet.id,
      projectId,
      data,
      rules,
      computed,
      dispatch,
      canEdit,
      saveStatus: status,
      retrySave: retry,
      applyServerSheet: (serverSheet) => {
        setRevision(serverSheet.revision);
        setRules(jobSheetRulesSchema.parse(serverSheet.rules));
        dispatch({
          type: 'replaceAll',
          data: jobSheetDataSchema.parse(serverSheet.data)
        });
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sheet.id, projectId, data, rules, computed, canEdit, status]
  );

  return <JobSheetContext.Provider value={value}>{children}</JobSheetContext.Provider>;
};
