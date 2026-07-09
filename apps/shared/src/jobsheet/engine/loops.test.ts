import { describe, expect, it } from 'bun:test';

import {
  jobSheetDataSchema,
  migrateJobSheetData,
  type Foundation
} from '../types';
import { neighboursInLoop, neighboursOf, wallLoops } from './loops';

const w = (id: string, foundationId = 'main') => ({ id, foundationId });
const f = (id: string, name = ''): Foundation => ({ id, name });

describe('wallLoops', () => {
  it('groups contiguous walls per foundation, in foundations order', () => {
    const loops = wallLoops({
      walls: [w('a'), w('b'), w('c', 'ext'), w('d', 'ext')],
      foundations: [f('main', 'Main foundation'), f('ext', 'Garage pad')]
    });
    expect(loops.map((l) => l.walls.map((x) => x.id))).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ]);
    expect(loops.map((l) => l.startIndex)).toEqual([0, 2]);
    expect(loops[1].name).toBe('Garage pad');
  });

  it('includes empty foundations and appends orphan ids', () => {
    const loops = wallLoops({
      walls: [w('a'), w('b', 'ghost')],
      foundations: [f('main'), f('empty', 'No walls yet')]
    });
    expect(loops.map((l) => l.foundationId)).toEqual(['main', 'empty', 'ghost']);
    expect(loops[1].walls).toHaveLength(0);
    expect(loops[2].walls.map((x) => x.id)).toEqual(['b']);
  });
});

describe('neighboursInLoop', () => {
  it('wraps within the loop and flags first/last', () => {
    const loop = [w('a'), w('b'), w('c')];
    expect(neighboursInLoop(loop, 0)).toMatchObject({
      prev: loop[2],
      next: loop[1],
      isFirst: true,
      isLast: false
    });
    expect(neighboursInLoop(loop, 2)).toMatchObject({
      prev: loop[1],
      next: loop[0],
      isFirst: false,
      isLast: true
    });
  });

  it('a single-wall loop is its own neighbour, first and last', () => {
    const loop = [w('only')];
    expect(neighboursInLoop(loop, 0)).toMatchObject({
      prev: loop[0],
      next: loop[0],
      isFirst: true,
      isLast: true
    });
  });
});

describe('neighboursOf', () => {
  it('never crosses foundations: the main loop wraps onto itself', () => {
    const data = {
      walls: [w('a'), w('b'), w('c', 'ext'), w('d', 'ext')],
      foundations: [f('main'), f('ext')]
    };
    expect(neighboursOf(data, 'b')).toMatchObject({
      prev: data.walls[0],
      next: data.walls[0],
      isLast: true
    });
    expect(neighboursOf(data, 'c')).toMatchObject({
      prev: data.walls[3],
      next: data.walls[3],
      isFirst: true
    });
    expect(neighboursOf(data, 'nope')).toBeNull();
  });
});

describe('migrateJobSheetData foundations normalization', () => {
  it('legacy documents parse into one main loop', () => {
    const data = migrateJobSheetData(
      jobSheetDataSchema.parse({ walls: [{ id: 'a', lengthMm: 1000 }] })
    );
    expect(data.foundations).toEqual([{ id: 'main', name: 'Main foundation' }]);
    expect(data.walls[0].foundationId).toBe('main');
  });

  it('adds metadata for orphan foundation ids and sorts walls contiguously', () => {
    const parsed = jobSheetDataSchema.parse({
      walls: [
        { id: 'a', lengthMm: 1, foundationId: 'ext' },
        { id: 'b', lengthMm: 1 },
        { id: 'c', lengthMm: 1, foundationId: 'ext' }
      ],
      foundations: [{ id: 'main', name: 'Main foundation' }]
    });
    const data = migrateJobSheetData(parsed);
    expect(data.foundations.map((x) => x.id)).toEqual(['main', 'ext']);
    // Stable within each loop, contiguous by foundations order.
    expect(data.walls.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('leaves an already-normalized document untouched (same reference)', () => {
    const parsed = jobSheetDataSchema.parse({
      walls: [{ id: 'a', lengthMm: 1 }],
      foundations: [{ id: 'main', name: 'Main foundation' }]
    });
    expect(migrateJobSheetData(parsed)).toBe(parsed);
  });
});
