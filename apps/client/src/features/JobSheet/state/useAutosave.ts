import { type JobSheetData } from '@dreams-built/shared/src/jobsheet/types';
import { useSaveJobSheetMutation } from 'api/jobsheets';
import { useEffect, useRef, useState } from 'react';
import { clearDraft, writeDraft } from './draftStorage';

export type SaveStatus =
  | 'saved'
  | 'pending'
  | 'saving'
  | 'offline'
  | 'error'
  | 'conflict';

const DEBOUNCE_MS = 1500;
const RETRY_MS = 15_000;

const isOnline = () =>
  typeof navigator === 'undefined' || navigator.onLine !== false;

/**
 * Debounced whole-document autosave with an optimistic-lock revision, built
 * to survive internet outages:
 *
 * - Every edit is mirrored to localStorage first (see draftStorage), so a
 *   refresh or crash while offline loses nothing — the provider restores
 *   the draft on next load.
 * - While offline, saves are held (status 'offline') and flushed the moment
 *   the browser fires 'online'.
 * - Transient failures auto-retry every 15s (plus a manual `retry`).
 * - A CONFLICT (someone else saved) stops autosave for good — the user must
 *   reload; their local edits stay in the draft until then.
 */
export const useAutosave = ({
  sheetId,
  projectId,
  initialRevision,
  data,
  enabled,
  initialDirty = false
}: {
  sheetId: string;
  projectId: string;
  initialRevision: number;
  data: JobSheetData;
  enabled: boolean;
  /** True when the provider restored an unsaved local draft on mount. */
  initialDirty?: boolean;
}) => {
  const save = useSaveJobSheetMutation({ projectId });
  const [status, setStatus] = useState<SaveStatus>(
    initialDirty ? 'pending' : 'saved'
  );

  const revisionRef = useRef(initialRevision);
  const latestRef = useRef(data);
  const dirtyRef = useRef(initialDirty);
  const statusRef = useRef<SaveStatus>(status);
  const isFirstRender = useRef(true);

  statusRef.current = status;
  latestRef.current = data;

  const saveNow = () => {
    if (statusRef.current === 'conflict') return;
    if (!isOnline()) {
      setStatus('offline');
      dirtyRef.current = true;
      return;
    }
    setStatus('saving');
    save.mutate(
      { sheetId, revision: revisionRef.current, data: latestRef.current },
      {
        onSuccess: (result) => {
          revisionRef.current = result.revision;
          if (dirtyRef.current) {
            // Edits arrived while the request was in flight: keep the draft
            // current against the new revision and stay pending.
            writeDraft(sheetId, {
              revision: result.revision,
              data: latestRef.current
            });
            setStatus('pending');
          } else {
            clearDraft(sheetId);
            setStatus('saved');
          }
        },
        onError: (error) => {
          if (!isOnline()) {
            setStatus('offline');
          } else if (error.data?.code === 'CONFLICT') {
            setStatus('conflict');
          } else {
            setStatus('error');
          }
        }
      }
    );
  };
  const saveNowRef = useRef(saveNow);
  saveNowRef.current = saveNow;

  const flush = () => {
    dirtyRef.current = false;
    saveNowRef.current();
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // Debounced save on edits; the draft is written immediately, before the
  // debounce, so even a instant crash keeps the keystroke.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!initialDirty) return undefined;
    }
    if (!enabled || statusRef.current === 'conflict') return undefined;

    dirtyRef.current = true;
    writeDraft(sheetId, { revision: revisionRef.current, data });
    if (statusRef.current !== 'offline') setStatus('pending');

    const timer = setTimeout(() => {
      dirtyRef.current = false;
      saveNowRef.current();
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled]);

  // Sync the moment connectivity returns.
  useEffect(() => {
    const handleOnline = () => {
      if (
        dirtyRef.current ||
        statusRef.current === 'offline' ||
        statusRef.current === 'error'
      ) {
        flushRef.current();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Auto-retry transient failures.
  useEffect(() => {
    if (status !== 'error') return undefined;
    const timer = setTimeout(() => flushRef.current(), RETRY_MS);
    return () => clearTimeout(timer);
  }, [status]);

  // Flush unsaved edits when the editor unmounts (route change).
  useEffect(
    () => () => {
      if (dirtyRef.current && statusRef.current !== 'conflict') {
        flushRef.current();
      }
    },
    []
  );

  return {
    status,
    /** Manual retry after a failure (also flushes pending edits). */
    retry: () => flushRef.current(),
    /**
     * Adopt a revision the server produced out-of-band (snapshot restore,
     * rules refresh) so the next autosave doesn't conflict with ourselves.
     */
    setRevision: (revision: number) => {
      revisionRef.current = revision;
      dirtyRef.current = false;
      clearDraft(sheetId);
      setStatus('saved');
    }
  };
};
