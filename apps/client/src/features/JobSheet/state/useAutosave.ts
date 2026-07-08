import { type JobSheetData } from '@dreams-built/shared/src/jobsheet/types';
import { useSaveJobSheetMutation } from 'api/jobsheets';
import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'saved' | 'pending' | 'saving' | 'error' | 'conflict';

const DEBOUNCE_MS = 1500;

/**
 * Debounced whole-document autosave with an optimistic-lock revision.
 *
 * Every successful save advances the revision the server expects next. A
 * CONFLICT (someone else saved from another tab) stops further autosaves —
 * the user must reload; anything else can be retried with `retry`.
 */
export const useAutosave = ({
  sheetId,
  initialRevision,
  data,
  enabled
}: {
  sheetId: string;
  initialRevision: number;
  data: JobSheetData;
  enabled: boolean;
}) => {
  const save = useSaveJobSheetMutation();
  const [status, setStatus] = useState<SaveStatus>('saved');

  const revisionRef = useRef(initialRevision);
  const latestRef = useRef(data);
  const dirtyRef = useRef(false);
  const statusRef = useRef<SaveStatus>('saved');
  const isFirstRender = useRef(true);

  statusRef.current = status;
  latestRef.current = data;

  const saveNow = () => {
    if (statusRef.current === 'conflict') return;
    setStatus('saving');
    save.mutate(
      { sheetId, revision: revisionRef.current, data: latestRef.current },
      {
        onSuccess: (result) => {
          revisionRef.current = result.revision;
          // Edits made while the request was in flight stay pending.
          setStatus(dirtyRef.current ? 'pending' : 'saved');
        },
        onError: (error) => {
          setStatus(error.data?.code === 'CONFLICT' ? 'conflict' : 'error');
        }
      }
    );
  };
  const saveNowRef = useRef(saveNow);
  saveNowRef.current = saveNow;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }
    if (!enabled || statusRef.current === 'conflict') return undefined;

    dirtyRef.current = true;
    setStatus('pending');
    const timer = setTimeout(() => {
      dirtyRef.current = false;
      saveNowRef.current();
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled]);

  // Flush unsaved edits when the editor unmounts (route change).
  useEffect(
    () => () => {
      if (dirtyRef.current && statusRef.current !== 'conflict') {
        dirtyRef.current = false;
        saveNowRef.current();
      }
    },
    []
  );

  return {
    status,
    /** Manual retry after a transient error (also flushes pending edits). */
    retry: () => {
      dirtyRef.current = false;
      saveNowRef.current();
    },
    /**
     * Adopt a revision the server produced out-of-band (snapshot restore,
     * rules refresh) so the next autosave doesn't conflict with ourselves.
     */
    setRevision: (revision: number) => {
      revisionRef.current = revision;
      setStatus('saved');
    }
  };
};
