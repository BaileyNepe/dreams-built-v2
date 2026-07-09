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
import { rebateReachesEnd, rebateReachesStart, resolveEnds } from './computeSheet';
import { computeRebateSegments } from './packRebate';

export type Point = { x: number; y: number };

export type PlacedCut = {
  cut: Cut;
  /** Distance along the wall from its start corner, in mm. */
  fromMm: number;
  toMm: number;
  /** BLK caps sit across the channel: drawn perpendicular to the wall. */
  perpendicular?: boolean;
  /** Inward shift for pieces on an inset slab edge (partial-rebate spans). */
  insetMm?: number;
};

export type PlacedRebateSegment = {
  fromMm: number;
  toMm: number;
  /** Where the pieces actually finish (overhang included) — the step face. */
  packedEndMm: number;
  cuts: PlacedCut[];
};

/**
 * A span where the slab edge steps IN by one rebate width: the bare
 * stretch between two brick portions of a partial-rebate wall.
 */
export type InsetSpan = { fromMm: number; toMm: number };

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
  insets: InsetSpan[];
};

/**
 * A physical conflict where two walls' boxing meets at a corner.
 *
 * Boxing must tile the perimeter with no overlap and no gap — a gap lets
 * concrete escape, an overlap puts two boards in the same space:
 * - At an INTERNAL corner, the perpendicular shutter sits inside the floor,
 *   so exactly ONE of the two walls must absorb the board thickness.
 * - At an EXTERNAL corner, the two rebate strips (which run inside the
 *   perimeter) cross, so exactly ONE wall needs the rebate offset there.
 */
export type CornerIssue = {
  /** 1-based number of the wall before the corner. */
  wallNumber: number;
  /** 1-based number of the wall after the corner. */
  nextWallNumber: number;
  kind: 'shutter-overlap' | 'shutter-gap' | 'rebate-overlap' | 'rebate-gap';
  message: string;
  /** Corner vertex, for drawing a marker. */
  at: Point;
};

export type FloorOutline = {
  walls: PlacedWall[];
  /** Polygon vertices (wall start points, plus the final walk end point). */
  vertices: Point[];
  /** Gap between where the walk ended and where it started. */
  misclosureMm: number;
  /** Corner overlap/gap conflicts in the boxing (see CornerIssue). */
  cornerIssues: CornerIssue[];
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

const BLK_THICKNESS_MM = 65;

const placeRebate = (
  wall: Wall,
  neighbours: { prev?: Wall; next?: Wall },
  computedWall: ComputedWall,
  rules: JobSheetRules
): PlacedRebateSegment[] => {
  const geometric = computeRebateSegments(wall, rules, resolveEnds(wall, neighbours).rebate);
  // Overridden walls may have a different number of runs than the geometric
  // segmentation suggests; align what we can and lay the rest sequentially.
  const segments = computedWall.rebate.map((run, index) => {
    const segment = geometric[index];
    const fromMm = segment?.startMm ?? 0;
    const toMm = segment?.endMm ?? fromMm + run.effectiveLengthMm;

    // Lay the pieces from the segment start; BLK caps sit perpendicular
    // across the channel — the end cap where the pieces finish (overhang
    // included), the start cap just before the brick line resumes.
    const pieces = run.cuts.filter((cut) => cut.kind !== 'blk');
    const placed = placeCuts(pieces, fromMm);
    const packedEndMm = placed.length > 0 ? placed[placed.length - 1].toMm : toMm;

    const caps: PlacedCut[] = [];
    if (segment?.blkAtStart) {
      caps.push({
        cut: { kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false },
        fromMm: fromMm - BLK_THICKNESS_MM,
        toMm: fromMm,
        perpendicular: true
      });
    }
    if (segment?.blkAtEnd) {
      caps.push({
        cut: { kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false },
        fromMm: packedEndMm,
        toMm: packedEndMm + BLK_THICKNESS_MM,
        perpendicular: true
      });
    }

    return { fromMm, toMm, packedEndMm, cuts: [...placed, ...caps] };
  });

  return segments;
};

/**
 * Check every corner for boxing conflicts. The corner between wall i and
 * wall i+1 is governed by wall i's end-corner kind; the closing corner
 * (last wall back to wall 1) only exists when the perimeter closes.
 */
const computeCornerIssues = (
  data: JobSheetData,
  rules: JobSheetRules,
  vertices: Point[],
  perimeterCloses: boolean
): CornerIssue[] => {
  const issues: CornerIssue[] = [];
  if (data.mode === 'manual') return issues;
  const { walls } = data;

  walls.forEach((wall, i) => {
    const j = (i + 1) % walls.length;
    if (j === 0 && !perimeterCloses) return;
    const next = walls[j];
    if (wall.lengthMm === 0 || next.lengthMm === 0) return;

    const at = vertices[i + 1] ?? vertices[0];
    const wallNumber = i + 1;
    const nextWallNumber = j + 1;

    const wallEnds = resolveEnds(wall, { prev: walls[(i - 1 + walls.length) % walls.length], next });
    const nextEnds = resolveEnds(next, { prev: wall, next: walls[(j + 1) % walls.length] });

    if (wall.cornerEnd === 'internal') {
      // The perpendicular shutter consumes one board thickness inside the
      // floor: exactly one of the two walls must absorb it.
      const absorbs =
        Number(wallEnds.absorbAtEnd) + Number(nextEnds.absorbAtStart);
      if (absorbs === 0) {
        issues.push({
          wallNumber,
          nextWallNumber,
          kind: 'shutter-overlap',
          message: `Walls ${wallNumber}→${nextWallNumber}: shutter boards overlap at the internal corner — tick "Absorb ${rules.shutterThicknessMm}mm" on one of the two walls.`,
          at
        });
      } else if (absorbs === 2) {
        issues.push({
          wallNumber,
          nextWallNumber,
          kind: 'shutter-gap',
          message: `Walls ${wallNumber}→${nextWallNumber}: both walls absorb at the same corner, leaving a ${rules.shutterThicknessMm}mm gap — untick one.`,
          at
        });
      }
    } else {
      // External corner: the two rebate strips run inside the perimeter and
      // cross each other unless exactly one wall carries the offset. Actual
      // segment geometry is used so openings at the corner don't flag.
      const endSegments = computeRebateSegments(wall, rules, wallEnds.rebate);
      const startSegments = computeRebateSegments(next, rules, nextEnds.rebate);
      const lastSegment = endSegments[endSegments.length - 1];
      const [firstSegment] = startSegments;
      const reachesCorner =
        wall.hasRebate && lastSegment !== undefined && lastSegment.endMm >= wall.lengthMm;
      const startsAtCorner =
        next.hasRebate && firstSegment !== undefined && firstSegment.startMm <= 0;

      if (reachesCorner && startsAtCorner) {
        issues.push({
          wallNumber,
          nextWallNumber,
          kind: 'rebate-overlap',
          message: `Walls ${wallNumber}→${nextWallNumber}: rebate strips overlap at the corner — tick a −${rules.rebateWidthMm} rebate offset on one of the two walls.`,
          at
        });
      } else if (
        wall.hasRebate &&
        next.hasRebate &&
        wallEnds.rebate.offsetAtEnd &&
        nextEnds.rebate.offsetAtStart
      ) {
        issues.push({
          wallNumber,
          nextWallNumber,
          kind: 'rebate-gap',
          message: `Walls ${wallNumber}→${nextWallNumber}: both walls offset the rebate at the same corner, leaving a ${rules.rebateWidthMm}mm gap — untick one.`,
          at
        });
      }
    }
  });

  return issues;
};

export const computeFloorOutline = (
  sourceData: JobSheetData,
  computed: ComputedSheet,
  rules: JobSheetRules
): FloorOutline => {
  const data: JobSheetData = sourceData.rebatesEnabled
    ? sourceData
    : {
        ...sourceData,
        walls: sourceData.walls.map((wall) => ({ ...wall, hasRebate: false }))
      };
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
    const ends = resolveEnds(wall, {
      prev: data.walls[(index - 1 + data.walls.length) % data.walls.length],
      next: data.walls[(index + 1) % data.walls.length]
    });
    const absorbOffset = ends.absorbAtStart ? rules.shutterThicknessMm : 0;

    // On a partial-rebate wall the shutter run is segmented: outer boards
    // over the brick portions, perpendicular BLKs at the steps, and inset
    // pieces laid one rebate-width inside along the stepped slab edge.
    const thickness = rules.shutterThicknessMm;
    const blkSpans = wall.hasRebate
      ? [...wall.rebateInsets]
          .filter((inset) => inset.widthMm > 0)
          .sort((a, b) => a.offsetFromStartMm - b.offsetFromStartMm)
      : [];

    let shutterCuts: PlacedCut[];
    if (blkSpans.length === 0) {
      shutterCuts = placeCuts(computedWall.shutters.cuts, absorbOffset);
    } else {
      // Split the flat cut list into groups at the BLK markers and lay each
      // group on its own line: outer boards on the boundary, inset pieces
      // one rebate-width in, perpendicular BLKs at the steps.
      const groups: Cut[][] = [[]];
      for (const cut of computedWall.shutters.cuts) {
        if (cut.kind === 'blk') groups.push([]);
        else groups[groups.length - 1].push(cut);
      }
      shutterCuts = [];
      let cursor = absorbOffset;
      let groupIndex = 0;
      blkSpans.forEach((span) => {
        const spanStart = Math.max(0, span.offsetFromStartMm);
        const spanEnd = Math.min(wall.lengthMm, span.offsetFromStartMm + span.widthMm);
        const leadingBlk = spanStart > cursor;
        const trailingBlk = spanEnd < wall.lengthMm;
        if (leadingBlk) {
          shutterCuts.push(...placeCuts(groups[groupIndex] ?? [], cursor));
          groupIndex += 1;
          shutterCuts.push({
            cut: { kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false },
            fromMm: spanStart,
            toMm: spanStart + thickness,
            perpendicular: true
          });
        }
        shutterCuts.push(
          ...placeCuts(
            groups[groupIndex] ?? [],
            // A span reaching the wall start lays from the absorb cursor,
            // matching the engine's inset-run start.
            leadingBlk ? spanStart + thickness : cursor
          ).map((placed) => ({ ...placed, insetMm: rules.rebateWidthMm }))
        );
        groupIndex += 1;
        if (trailingBlk) {
          shutterCuts.push({
            cut: { kind: 'blk', lengthMm: rules.blkLengthMm, polystyrene: false },
            fromMm: spanEnd - thickness,
            toMm: spanEnd,
            perpendicular: true
          });
          cursor = spanEnd - thickness;
        } else {
          cursor = spanEnd;
        }
      });
      if (cursor < wall.lengthMm) {
        shutterCuts.push(...placeCuts(groups[groupIndex] ?? [], cursor));
      }
    }

    // The slab edge steps in across every inset span.
    const wallInsets: InsetSpan[] = blkSpans.map((span) => ({
      fromMm: Math.max(0, span.offsetFromStartMm),
      toMm: Math.min(wall.lengthMm, span.offsetFromStartMm + span.widthMm)
    }));

    walls.push({
      id: wall.id,
      number: computedWall.number,
      lengthMm: wall.lengthMm,
      isGarageDoorWall: wall.isGarageDoorWall,
      start,
      end,
      direction: heading,
      outwardNormal,
      shutterCuts,
      rebateSegments: placeRebate(
        wall,
        {
          prev: data.walls[(index - 1 + data.walls.length) % data.walls.length],
          next: data.walls[(index + 1) % data.walls.length]
        },
        computedWall,
        rules
      ),
      insets: wallInsets
    });

    // The true corner sits off the nominal (brick-line) walk wherever a
    // bare stretch meets it: a wall whose inset runs to this end meets its
    // neighbour on the frame line, one rebate width inside its own nominal
    // line — and the next wall's nominal line sits one width outside the
    // corner when ITS start stretch is bare. Measurements follow the
    // actual slab faces, so without these jogs partial-brick floors would
    // report a phantom misclosure.
    const corner = { ...end };
    if (wall.hasRebate && !rebateReachesEnd(wall)) {
      corner.x -= outwardNormal.x * rules.rebateWidthMm;
      corner.y -= outwardNormal.y * rules.rebateWidthMm;
    }
    vertices.push({ ...corner });

    // Turn at this wall's end corner: right at external, left at internal,
    // by the wall's angled override when set (degrees of turn; 90 = square).
    const turn = wall.angledCornerDeg ?? 90;
    heading = rotate(heading, wall.cornerEnd === 'external' ? turn : -turn);

    position = corner;
    const nextWall = data.walls[(index + 1) % data.walls.length];
    if (nextWall.hasRebate && !rebateReachesStart(nextWall)) {
      position = {
        x: position.x + heading.y * rules.rebateWidthMm,
        y: position.y - heading.x * rules.rebateWidthMm
      };
    }
  });

  const misclosureMm = Math.round(Math.hypot(position.x, position.y));

  const xs = vertices.map((v) => v.x);
  const ys = vertices.map((v) => v.y);
  const bounds = {
    minX: Math.min(...xs, 0),
    minY: Math.min(...ys, 0),
    maxX: Math.max(...xs, 0),
    maxY: Math.max(...ys, 0)
  };

  const cornerIssues = computeCornerIssues(data, rules, vertices, misclosureMm <= 1);

  return { walls, vertices, misclosureMm, cornerIssues, bounds };
};
