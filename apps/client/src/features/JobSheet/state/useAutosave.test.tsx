import { jobSheetDataSchema } from '@dreams-built/shared/src/jobsheet/types';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutosave } from './useAutosave';

const { mockMutate } = vi.hoisted(() => ({ mockMutate: vi.fn() }));

vi.mock('api/jobsheets', () => ({
  useSaveJobSheetMutation: () => ({ mutate: mockMutate })
}));

const emptyData = jobSheetDataSchema.parse({});
const editedData = { ...emptyData, notes: 'edited' };
const DRAFT_KEY = 'jobsheet:draft:sheet1';

const renderAutosave = (initialDirty = false) =>
  renderHook(
    ({ data }) =>
      useAutosave({
        sheetId: 'sheet1',
        projectId: 'project1',
        initialRevision: 3,
        data,
        enabled: true,
        initialDirty
      }),
    { initialProps: { data: emptyData } }
  );

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMutate.mockReset();
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not save on mount', () => {
    renderAutosave();
    act(() => vi.advanceTimersByTime(5000));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('debounces edits, then saves with the tracked revision', () => {
    const { result, rerender } = renderAutosave();

    rerender({ data: editedData });
    expect(result.current.status).toBe('pending');
    act(() => vi.advanceTimersByTime(1000));
    expect(mockMutate).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(600));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toEqual({
      sheetId: 'sheet1',
      revision: 3,
      data: editedData
    });
    expect(result.current.status).toBe('saving');

    // Server acknowledges with the bumped revision.
    act(() => mockMutate.mock.calls[0][1].onSuccess({ revision: 4 }));
    expect(result.current.status).toBe('saved');

    // The next save uses the new revision.
    rerender({ data: { ...editedData, notes: 'edited again' } });
    act(() => vi.advanceTimersByTime(1600));
    expect(mockMutate.mock.calls[1][0].revision).toBe(4);
  });

  it('resets the debounce window on rapid consecutive edits', () => {
    const { rerender } = renderAutosave();
    rerender({ data: { ...emptyData, notes: 'a' } });
    act(() => vi.advanceTimersByTime(1000));
    rerender({ data: { ...emptyData, notes: 'ab' } });
    act(() => vi.advanceTimersByTime(1000));
    expect(mockMutate).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(600));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0].data.notes).toBe('ab');
  });

  it('stops autosaving after a revision conflict', () => {
    const { result, rerender } = renderAutosave();
    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(1600));
    act(() =>
      mockMutate.mock.calls[0][1].onError({ data: { code: 'CONFLICT' } })
    );
    expect(result.current.status).toBe('conflict');

    rerender({ data: { ...editedData, notes: 'more edits' } });
    act(() => vi.advanceTimersByTime(5000));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('marks transient failures as error and retries on demand', () => {
    const { result, rerender } = renderAutosave();
    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(1600));
    act(() =>
      mockMutate.mock.calls[0][1].onError({ data: { code: 'INTERNAL_SERVER_ERROR' } })
    );
    expect(result.current.status).toBe('error');

    act(() => result.current.retry());
    expect(mockMutate).toHaveBeenCalledTimes(2);
  });

  it('flushes pending edits on unmount', () => {
    const { rerender, unmount } = renderAutosave();
    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(500)); // still inside the debounce window
    unmount();
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0].data).toEqual(editedData);
  });

  it('adopts an out-of-band server revision via setRevision', () => {
    const { result, rerender } = renderAutosave();
    act(() => result.current.setRevision(9));

    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(1600));
    expect(mockMutate.mock.calls[0][0].revision).toBe(9);
  });

  it('mirrors edits into a localStorage draft and clears it after a save', () => {
    const { rerender } = renderAutosave();
    rerender({ data: editedData });

    const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null');
    expect(draft).toMatchObject({ revision: 3, data: editedData });

    act(() => vi.advanceTimersByTime(1600));
    act(() => mockMutate.mock.calls[0][1].onSuccess({ revision: 4 }));
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('holds saves while offline and syncs when connectivity returns', () => {
    const onLine = vi.spyOn(window.navigator, 'onLine', 'get');
    onLine.mockReturnValue(false);

    const { result, rerender } = renderAutosave();
    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(1600));

    expect(result.current.status).toBe('offline');
    expect(mockMutate).not.toHaveBeenCalled();
    // The edit is safe on disk while offline.
    expect(window.localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    onLine.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0].data).toEqual(editedData);
  });

  it('auto-retries a failed save after the retry interval', () => {
    const { rerender } = renderAutosave();
    rerender({ data: editedData });
    act(() => vi.advanceTimersByTime(1600));
    act(() =>
      mockMutate.mock.calls[0][1].onError({ data: { code: 'INTERNAL_SERVER_ERROR' } })
    );
    expect(mockMutate).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(15_100));
    expect(mockMutate).toHaveBeenCalledTimes(2);
  });

  it('saves a restored draft on mount without requiring new edits (initialDirty)', () => {
    const { result } = renderAutosave(true);
    expect(result.current.status).toBe('pending');
    act(() => vi.advanceTimersByTime(1600));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toMatchObject({ revision: 3 });
  });
});
