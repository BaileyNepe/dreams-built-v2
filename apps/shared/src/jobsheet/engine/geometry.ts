/**
 * Reconstruct the foundation outline from the wall list.
 *
 * The sheet stores exactly what the paper does — lengths and corner kinds —
 * which is enough to walk the perimeter: start at the garage-door wall
 * heading east, walk clockwise, turn right at external corners and left at
 * internal ones (90° unless the wall's `angledCornerDeg` overrides the turn
 * at its end corner).
 *
 * Coordinates are millimetres in SVG screen space (y grows downwards); the
 * building interior is on the right of the direction of travel, so the
 * outward normal of a heading (dx, dy) is (dy, -dx).
 *
 * If the measurements don't close the polygon, the walk still renders and
 * `misclosureMm` reports the gap — a drawing/validation aid, never an error.
 */

import type {
  ComputedSheet,
  ComputedWall,
  Cut,
  JobSheetData,
  JobSheetRules,
  Wall
} from '../types';
import { computeRebateSegments } from './packRebate';

export type Point = { x: number; y: number };

export type PlacedCut = {
  cut: Cut;
  /** Distance along the wall from its start corner, in mm. */
  fromMm: number;
  toMm: number;
};

export type PlacedRebateSegment = {
  fromMm: number;
  toMm: number;
  cuts: PlacedCut[];
};

export type PlacedWall = {
  id: string;
  number: number;
  lengthMm: number;
  isGarageDoorWall: boolean;
  start: Point;
  end: Point;
  /** Unit vector of the direction of travel. */
  direction: Point;
  /** Unit vector pointing away from the building. */
  outwardNormal: Point;
  shutterCuts: PlacedCut[];
  rebateSegments: PlacedRebateSegment[];
};

export type FloorOutline = {
  walls: PlacedWall[];
  /** Polygon vertices (wall start points, plus the final walk end point). */
  vertices: Point[];
  /** Gap between where the walk ended and where it started. */
  misclosureMm: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
};

const DEGREES_TO_RADIANS = Math.PI / 180;

/** Snap values that are within float noise of -1, 0 or 1, so chains of 90° turns stay exact. */
const snap = (n: number): number => {
  for (const exact of [-1, 0, 1]) {
    if (Math.abs(n - exact) < 1e-9) return exact;
  }
  return n;
};

/** Rotate a heading; positive angles turn right (clockwise on screen). */
const rotate = (v: Point, degrees: number): Point => {
  const a = degrees * DEGREES_TO_RADIANS;
  return {
    x: snap(v.x * Math.cos(a) - v.y * Math.sin(a)),
    y: snap(v.x * Math.sin(a) + v.y * Math.cos(a))
  };
};

const placeCuts = (cuts: Cut[], startOffsetMm: number): PlacedCut[] => {
  const placed: PlacedCut[] = [];
  let cursor = startOffsetMm;
  for (const cut of cuts) {
    placed.push({ cut, fromMm: cursor, toMm: cursor + cut.lengthMm });
    cursor += cut.lengthMm;
  }
  return placed;
};

const placeRebate = (
  wall: Wall,
  computedWall: ComputedWall,
  rules: JobSheetRules
): PlacedRebateSegment[] => {
  const segments = computeRebateSegments(wall, rules);
  // Overridden walls may have a different number of runs than the geometric
  // segmentation suggests; align what we can and lay the rest sequentially.
  return computedWall.rebate.map((run, index) => {
    const segment = segments[index];
    const fromMm = segment?.startMm ?? 0;
    const toMm = segment?.endMm ?? fromMm + run.effectiveLengthMm;
    return { fromMm, toMm, cuts: placeCuts(run.cuts, fromMm) };
  });
};

export const computeFloorOutline = (
  data: JobSheetData,
  computed: ComputedSheet,
  rules: JobSheetRules
): FloorOutline => {
  let position: Point = { x: 0, y: 0 };
  let heading: Point = { x: 1, y: 0 };

  const walls: PlacedWall[] = [];
  const vertices: Point[] = [{ ...position }];

  data.walls.forEach((wall, index) => {
    const computedWall = computed.walls[index];
    const start = { ...position };
    const end = {
      x: start.x + heading.x * wall.lengthMm,
      y: start.y + heading.y * wall.lengthMm
    };
    const outwardNormal = { x: heading.y, y: -heading.x };

    // Shutter cuts start after any absorbed board at the wall start; BLK
    // markers at the very start would otherwise push everything sideways,
    // so the offset only applies to the packed run itself.
    const absorbOffset = wall.absorbShutterAtStart ? rules.shutterThicknessMm : 0;

    walls.push({
      id: wall.id,
      number: computedWall.number,
      lengthMm: wall.lengthMm,
      isGarageDoorWall: wall.isGarageDoorWall,
      start,
      end,
      direction: heading,
      outwardNormal,
      shutterCuts: placeCuts(computedWall.shutters.cuts, absorbOffset),
      rebateSegments: placeRebate(wall, computedWall, rules)
    });

    position = end;
    vertices.push({ ...position });

    // Turn at this wall's end corner: right at external, left at internal,
    // by the wall's angled override when set (degrees of turn; 90 = square).
    const turn = wall.angledCornerDeg ?? 90;
    heading = rotate(heading, wall.cornerEnd === 'external' ? turn : -turn);
  });

  const misclosureMm = Math.hypot(position.x, position.y);

  const xs = vertices.map((v) => v.x);
  const ys = vertices.map((v) => v.y);
  const bounds = {
    minX: Math.min(...xs, 0),
    minY: Math.min(...ys, 0),
    maxX: Math.max(...xs, 0),
    maxY: Math.max(...ys, 0)
  };

  return { walls, vertices, misclosureMm: Math.round(misclosureMm), bounds };
};
