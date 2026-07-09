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
  rebateExtendAtStart: false,
  rebateExtendAtEnd: false,
  overhangCapAtEnd: false,
  blkAtStart: false,
  blkAtEnd: false,
  openings: [],
  rebateInsets: [],
  manualRuns: [],
  polystyreneOverride: null,
  angledCornerDeg: null,
  isGarageDoorWall: false,
  notes: '',
  override: null,
  ...patch
});

const sheetOf = (walls: Wall[]): JobSheetData => ({
  system: 'PROBASE',
  rebatesEnabled: true,
  mode: 'auto',
  manualThirdColumn: false,
  thirdColumnLabel: 'Other',
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

/** A rectangle whose boxing is fully sealed: one rebate offset per corner. */
const cleanRectangle = () => [
  wall('w1', 6000, { isGarageDoorWall: true, rebateOffsetAtStart: true }),
  wall('w2', 4000, { rebateOffsetAtStart: true }),
  wall('w3', 6000, { rebateOffsetAtStart: true }),
  wall('w4', 4000, { rebateOffsetAtStart: true })
];

describe('computeFloorOutline: closure', () => {
  it('closes a rectangle exactly', () => {
    const outline = outlineOf(cleanRectangle());
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
            hasRebate: false,
            blk: false
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

describe('computeFloorOutline: corner seal analysis', () => {
  // L-shape: internal corner between walls 4 and 5.
  const lShape = (w4: Partial<Wall> = {}, w5: Partial<Wall> = {}) => [
    wall('w1', 6000, { rebateOffsetAtStart: true }),
    wall('w2', 4000, { rebateOffsetAtStart: true }),
    wall('w3', 2000, { rebateOffsetAtStart: true }),
    wall('w4', 2000, { cornerEnd: 'internal', rebateOffsetAtStart: true, ...w4 }),
    wall('w5', 4000, { ...w5 }),
    wall('w6', 2000, { rebateOffsetAtStart: true })
  ];

  it('reports no issues on a fully sealed rectangle', () => {
    expect(outlineOf(cleanRectangle()).cornerIssues).toEqual([]);
  });

  it('flags a shutter overlap at an internal corner where neither wall absorbs', () => {
    const outline = outlineOf(lShape());
    const shutterIssues = outline.cornerIssues.filter((i) => i.kind.startsWith('shutter'));
    expect(shutterIssues).toHaveLength(1);
    expect(shutterIssues[0]).toMatchObject({
      kind: 'shutter-overlap',
      wallNumber: 4,
      nextWallNumber: 5
    });
    // The marker sits at the corner between walls 4 and 5.
    expect(shutterIssues[0].at).toEqual(outline.vertices[4]);
  });

  it('is sealed when exactly one wall absorbs at the internal corner', () => {
    const oneAbsorbs = outlineOf(lShape({ absorbShutterAtEnd: true }));
    expect(oneAbsorbs.cornerIssues.filter((i) => i.kind.startsWith('shutter'))).toEqual(
      []
    );
    const otherAbsorbs = outlineOf(lShape({}, { absorbShutterAtStart: true }));
    expect(
      otherAbsorbs.cornerIssues.filter((i) => i.kind.startsWith('shutter'))
    ).toEqual([]);
  });

  it('flags a shutter gap when both walls absorb at the same corner', () => {
    const outline = outlineOf(
      lShape({ absorbShutterAtEnd: true }, { absorbShutterAtStart: true })
    );
    expect(outline.cornerIssues.filter((i) => i.kind.startsWith('shutter'))).toEqual([
      expect.objectContaining({ kind: 'shutter-gap', wallNumber: 4, nextWallNumber: 5 })
    ]);
  });

  it('flags rebate overlap at an external corner with no offset, and a gap with two', () => {
    const noOffsets = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000, { rebateOffsetAtStart: true }),
      wall('w3', 6000, { rebateOffsetAtStart: true }),
      wall('w4', 4000, { rebateOffsetAtStart: true })
    ]);
    // Corner between walls 1 and 2 carries the offset; corner 4->1 does not.
    expect(noOffsets.cornerIssues).toEqual([
      expect.objectContaining({
        kind: 'rebate-overlap',
        wallNumber: 4,
        nextWallNumber: 1
      })
    ]);

    const doubleOffset = outlineOf(
      cleanRectangle().map((w) =>
        w.id === 'w1' ? { ...w, rebateOffsetAtEnd: true } : w
      )
    );
    expect(doubleOffset.cornerIssues).toEqual([
      expect.objectContaining({ kind: 'rebate-gap', wallNumber: 1, nextWallNumber: 2 })
    ]);
  });

  it('reports no rebate issue when a wall has no rebate at that corner', () => {
    const outline = outlineOf(
      cleanRectangle().map((w) =>
        w.id === 'w2' ? { ...w, hasRebate: false, rebateOffsetAtStart: false } : w
      )
    );
    // Wall 2 has no rebate: corners 1->2 and 2->3 can't conflict. Corner 2->3
    // loses its offset carrier but wall 2 has no strip to collide with.
    expect(outline.cornerIssues).toEqual([]);
  });

  it('skips the closing corner when the perimeter does not close', () => {
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 5400) // open shape: no corner between w3 and w1
    ]);
    expect(outline.misclosureMm).toBeGreaterThan(0);
    expect(
      outline.cornerIssues.some((i) => i.wallNumber === 3 && i.nextWallNumber === 1)
    ).toBe(false);
  });
});
