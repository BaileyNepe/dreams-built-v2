import { jobSheetDataSchema } from '@dreams-built/shared/src/jobsheet/types';
import { describe, expect, it } from 'vitest';
import { emptyWall, jobSheetReducer } from './jobSheetReducer';

const emptyData = jobSheetDataSchema.parse({});

const dataWithWalls = (...ids: string[]) => ({
  ...emptyData,
  walls: ids.map((id) => emptyWall(id))
});

describe('jobSheetReducer: walls', () => {
  it('addWall appends a blank wall with the given id', () => {
    const state = jobSheetReducer(emptyData, { type: 'addWall', id: 'w1' });
    expect(state.walls).toHaveLength(1);
    expect(state.walls[0]).toMatchObject({ id: 'w1', lengthMm: 0, hasRebate: true });
  });

  it('updateWall patches only the targeted wall', () => {
    const state = jobSheetReducer(dataWithWalls('w1', 'w2'), {
      type: 'updateWall',
      id: 'w2',
      patch: { lengthMm: 3380, notes: 'north face' }
    });
    expect(state.walls[0].lengthMm).toBe(0);
    expect(state.walls[1]).toMatchObject({ lengthMm: 3380, notes: 'north face' });
  });

  it('keeps the shared corner in sync between adjacent walls', () => {
    // Changing wall 1's END corner is changing wall 2's START corner: it is
    // the same physical corner of the foundation.
    let state = jobSheetReducer(dataWithWalls('w1', 'w2', 'w3'), {
      type: 'updateWall',
      id: 'w1',
      patch: { cornerEnd: 'internal' }
    });
    expect(state.walls[0].cornerEnd).toBe('internal');
    expect(state.walls[1].cornerStart).toBe('internal');

    // Flipping it back to external clears an absorb that no longer applies.
    state = jobSheetReducer(state, {
      type: 'updateWall',
      id: 'w2',
      patch: { absorbShutterAtStart: true }
    });
    state = jobSheetReducer(state, {
      type: 'updateWall',
      id: 'w1',
      patch: { cornerEnd: 'external' }
    });
    expect(state.walls[1]).toMatchObject({
      cornerStart: 'external',
      absorbShutterAtStart: null
    });

    // The last wall's end corner wraps around to the first wall's start.
    state = jobSheetReducer(state, {
      type: 'updateWall',
      id: 'w3',
      patch: { cornerEnd: 'internal' }
    });
    expect(state.walls[0].cornerStart).toBe('internal');

    // And editing a start corner syncs the previous wall's end corner.
    state = jobSheetReducer(state, {
      type: 'updateWall',
      id: 'w3',
      patch: { cornerStart: 'internal' }
    });
    expect(state.walls[1].cornerEnd).toBe('internal');
  });

  it('removeWall drops the wall; renumbering is implicit in array order', () => {
    const state = jobSheetReducer(dataWithWalls('w1', 'w2', 'w3'), {
      type: 'removeWall',
      id: 'w2'
    });
    expect(state.walls.map((wall) => wall.id)).toEqual(['w1', 'w3']);
  });

  it('moveWall reorders and is a no-op for out-of-range indices', () => {
    const start = dataWithWalls('w1', 'w2', 'w3');
    const moved = jobSheetReducer(start, { type: 'moveWall', from: 2, to: 0 });
    expect(moved.walls.map((wall) => wall.id)).toEqual(['w3', 'w1', 'w2']);

    expect(jobSheetReducer(start, { type: 'moveWall', from: 0, to: 5 })).toBe(start);
    expect(jobSheetReducer(start, { type: 'moveWall', from: 1, to: 1 })).toBe(start);
  });

  it('setOverride stores and clears the manual override', () => {
    const override = {
      shutterCuts: [{ kind: 'standard' as const, lengthMm: 3000, polystyrene: false }],
      rebateRuns: [],
      note: ''
    };
    const withOverride = jobSheetReducer(dataWithWalls('w1'), {
      type: 'setOverride',
      id: 'w1',
      override
    });
    expect(withOverride.walls[0].override).toEqual(override);

    const cleared = jobSheetReducer(withOverride, {
      type: 'setOverride',
      id: 'w1',
      override: null
    });
    expect(cleared.walls[0].override).toBeNull();
  });
});

describe('jobSheetReducer: section items and notes', () => {
  it('add/update/remove items in a section', () => {
    let state = jobSheetReducer(emptyData, {
      type: 'addItem',
      section: 'joinery',
      id: 'i1'
    });
    state = jobSheetReducer(state, {
      type: 'updateItem',
      section: 'joinery',
      id: 'i1',
      patch: { text: 'Garage door 4850', qty: 2 }
    });
    expect(state.joinery).toEqual([{ id: 'i1', text: 'Garage door 4850', qty: 2 }]);
    expect(state.showerBoxes).toEqual([]);

    state = jobSheetReducer(state, { type: 'removeItem', section: 'joinery', id: 'i1' });
    expect(state.joinery).toEqual([]);
  });

  it('setNotes and replaceAll', () => {
    const withNotes = jobSheetReducer(emptyData, {
      type: 'setNotes',
      notes: 'pour Friday'
    });
    expect(withNotes.notes).toBe('pour Friday');

    const replaced = jobSheetReducer(withNotes, {
      type: 'replaceAll',
      data: dataWithWalls('w9')
    });
    expect(replaced.walls.map((wall) => wall.id)).toEqual(['w9']);
    expect(replaced.notes).toBe('');
  });
});

describe('jobSheetReducer: foundations', () => {
  const twoLoops = () => ({
    ...emptyData,
    foundations: [
      { id: 'main', name: 'Main foundation' },
      { id: 'ext', name: 'Garage pad' }
    ],
    walls: [emptyWall('a1'), emptyWall('a2'), emptyWall('x1', 'ext'), emptyWall('x2', 'ext')]
  });

  it('addWall inserts at the named loop end, keeping loops contiguous', () => {
    const state = jobSheetReducer(twoLoops(), {
      type: 'addWall',
      id: 'a3',
      foundationId: 'main'
    });
    expect(state.walls.map((w) => w.id)).toEqual(['a1', 'a2', 'a3', 'x1', 'x2']);
    expect(state.walls[2].foundationId).toBe('main');
  });

  it('addWall without a foundationId joins the last foundation', () => {
    const state = jobSheetReducer(twoLoops(), { type: 'addWall', id: 'x3' });
    expect(state.walls.map((w) => w.id)).toEqual(['a1', 'a2', 'x1', 'x2', 'x3']);
    expect(state.walls[4].foundationId).toBe('ext');
  });

  it('corner sync wraps within the loop, never across foundations', () => {
    // a2 is the LAST wall of the main loop: its end corner is a1's start
    // corner, not x1's.
    const state = jobSheetReducer(twoLoops(), {
      type: 'updateWall',
      id: 'a2',
      patch: { cornerEnd: 'internal' }
    });
    expect(state.walls[0].cornerStart).toBe('internal'); // a1
    expect(state.walls[2].cornerStart).toBe('external'); // x1 untouched
  });

  it('moveWall re-stamps the moved wall with the loop it lands in', () => {
    const state = jobSheetReducer(twoLoops(), { type: 'moveWall', from: 1, to: 3 });
    expect(state.walls.map((w) => w.id)).toEqual(['a1', 'x1', 'x2', 'a2']);
    expect(state.walls[3].foundationId).toBe('ext');
  });

  it('addFoundation appends metadata and optionally seeds the first wall', () => {
    const state = jobSheetReducer(twoLoops(), {
      type: 'addFoundation',
      id: 'porch',
      name: 'Porch pad',
      wallId: 'p1'
    });
    expect(state.foundations.map((f) => f.id)).toEqual(['main', 'ext', 'porch']);
    expect(state.walls.at(-1)).toMatchObject({ id: 'p1', foundationId: 'porch' });
    // Duplicate ids are refused.
    expect(jobSheetReducer(state, { type: 'addFoundation', id: 'ext' })).toBe(state);
  });

  it('renameFoundation updates only the named loop', () => {
    const state = jobSheetReducer(twoLoops(), {
      type: 'renameFoundation',
      id: 'ext',
      name: 'Sleepout'
    });
    expect(state.foundations[1].name).toBe('Sleepout');
    expect(state.foundations[0].name).toBe('Main foundation');
  });

  it('removeFoundation drops the metadata and its walls, but never the first', () => {
    const state = jobSheetReducer(twoLoops(), { type: 'removeFoundation', id: 'ext' });
    expect(state.foundations.map((f) => f.id)).toEqual(['main']);
    expect(state.walls.map((w) => w.id)).toEqual(['a1', 'a2']);
    expect(jobSheetReducer(state, { type: 'removeFoundation', id: 'main' })).toBe(state);
  });
});
