import { describe, expect, it } from 'bun:test';

import { DEFAULT_JOBSHEET_RULES } from '../defaults';
import type { JobSheetData, Wall } from '../types';
import { computeJobSheet } from './computeSheet';
import { computeFloorOutline } from './geometry';

const rules = DEFAULT_JOBSHEET_RULES;

const wall = (id: string, lengthMm: number, patch: Partial<Wall> = {}): Wall => ({
  id,
  lengthMm,
  cornerStart: 'external',
  cornerEnd: 'external',
  absorbShutterAtStart: false,
  absorbShutterAtEnd: false,
  hasRebate: true,
  rebateOffsetAtStart: false,
  rebateOffsetAtEnd: false,
  blkAtStart: false,
  blkAtEnd: false,
  openings: [],
  polystyreneOverride: null,
  angledCornerDeg: null,
  isGarageDoorWall: false,
  notes: '',
  override: null,
  ...patch
});

const sheetOf = (walls: Wall[]): JobSheetData => ({
  system: 'PROBASE',
  walls,
  joinery: [],
  showerBoxes: [],
  garage: [],
  notes: ''
});

const outlineOf = (walls: Wall[]) => {
  const data = sheetOf(walls);
  return computeFloorOutline(data, computeJobSheet(data, rules), rules);
};

describe('computeFloorOutline: closure', () => {
  it('closes a rectangle exactly', () => {
    const outline = outlineOf([
      wall('w1', 6000, { isGarageDoorWall: true }),
      wall('w2', 4000),
      wall('w3', 6000),
      wall('w4', 4000)
    ]);
    expect(outline.misclosureMm).toBe(0);
    expect(outline.walls[0].start).toEqual({ x: 0, y: 0 });
    expect(outline.walls[0].end).toEqual({ x: 6000, y: 0 });
    // Clockwise on screen: second wall heads down (south).
    expect(outline.walls[1].end.y).toBeCloseTo(4000, 3);
    expect(outline.bounds).toEqual({ minX: 0, minY: 0, maxX: 6000, maxY: 4000 });
  });

  it('closes an L-shape with one internal corner', () => {
    // 6x4 rectangle with a 2x2 notch: internal corner where the notch turns.
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 2000),
      wall('w4', 2000, { cornerEnd: 'internal' }),
      wall('w5', 4000),
      wall('w6', 2000)
    ]);
    expect(outline.misclosureMm).toBe(0);
  });

  it('reports the misclosure when a wall is measured short', () => {
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 5400), // 600 short
      wall('w4', 4000)
    ]);
    expect(outline.misclosureMm).toBe(600);
  });

  it('honours an angled corner turn override', () => {
    // 45° turns: a regular octagon with equal sides closes exactly.
    const side = 2000;
    const octagon = Array.from({ length: 8 }, (_, i) =>
      wall(`w${i}`, side, { angledCornerDeg: 45 })
    );
    const outline = outlineOf(octagon);
    expect(outline.misclosureMm).toBe(0);
  });
});

describe('computeFloorOutline: placements', () => {
  it('lays shutter cuts end to end from the wall start', () => {
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 6000),
      wall('w4', 4000)
    ]);
    // 6000 -> [4800, 1200]
    expect(outline.walls[0].shutterCuts).toEqual([
      { cut: { kind: 'standard', lengthMm: 4800, polystyrene: false }, fromMm: 0, toMm: 4800 },
      { cut: { kind: 'standard', lengthMm: 1200, polystyrene: false }, fromMm: 4800, toMm: 6000 }
    ]);
  });

  it('offsets the shutter run past an absorbed board at the start', () => {
    const outline = outlineOf([
      wall('w1', 6000, {
        cornerStart: 'internal',
        cornerEnd: 'internal',
        absorbShutterAtStart: true
      }),
      wall('w2', 4000),
      wall('w3', 6000),
      wall('w4', 4000)
    ]);
    expect(outline.walls[0].shutterCuts[0].fromMm).toBe(rules.shutterThicknessMm);
  });

  it('places rebate segments where the offsets and openings put them', () => {
    const outline = outlineOf([
      wall('w1', 6420, {
        openings: [
          {
            kind: 'garage_door',
            widthMm: 4850,
            offsetFromStartMm: 785,
            hasRebate: false
          }
        ]
      }),
      wall('w2', 4000),
      wall('w3', 6420),
      wall('w4', 4000)
    ]);
    const segments = outline.walls[0].rebateSegments;
    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ fromMm: 0, toMm: 785 });
    expect(segments[1]).toMatchObject({ fromMm: 5635, toMm: 6420 });
    // Cuts inside a segment start at the segment, not at the wall origin.
    expect(segments[1].cuts[0].fromMm).toBe(5635);
  });

  it('outward normals point away from the building on every side', () => {
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 6000),
      wall('w4', 4000)
    ]);
    expect(outline.walls[0].outwardNormal).toEqual({ x: 0, y: -1 }); // top: up
    expect(outline.walls[1].outwardNormal.x).toBeCloseTo(1, 6); // right: east
    expect(outline.walls[2].outwardNormal.y).toBeCloseTo(1, 6); // bottom: down
    expect(outline.walls[3].outwardNormal.x).toBeCloseTo(-1, 6); // left: west
  });
});
