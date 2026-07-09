import type { Foundation } from '../types';

/**
 * Perimeter-loop helpers. A sheet holds one flat, ordered `walls` array;
 * each wall belongs to a foundation (loop) via `foundationId` and walls of
 * a loop stay contiguous (normalized by `migrateJobSheetData`). Every
 * neighbour relationship — including the first/last "wall 1 is boxed
 * first" exception and the last→first closing corner — wraps WITHIN a
 * loop, never across detached foundations.
 */

type LoopWall = { foundationId: string };

export type WallLoop<W extends LoopWall> = {
  foundationId: string;
  name: string;
  /** Flat index of this loop's first wall (insertion point when empty). */
  startIndex: number;
  walls: W[];
};

/** One loop per foundation, in foundations order; empty loops included. */
export const wallLoops = <W extends LoopWall>(data: {
  walls: W[];
  foundations: Foundation[];
}): WallLoop<W>[] => {
  const byId = new Map<string, WallLoop<W>>();
  const loops = data.foundations.map((foundation) => {
    const loop: WallLoop<W> = {
      foundationId: foundation.id,
      name: foundation.name,
      startIndex: 0,
      walls: []
    };
    byId.set(foundation.id, loop);
    return loop;
  });
  data.walls.forEach((wall) => {
    // Orphan ids get a trailing loop so nothing is ever silently dropped.
    let loop = byId.get(wall.foundationId);
    if (!loop) {
      loop = { foundationId: wall.foundationId, name: '', startIndex: 0, walls: [] };
      byId.set(wall.foundationId, loop);
      loops.push(loop);
    }
    loop.walls.push(wall);
  });
  let start = 0;
  for (const loop of loops) {
    loop.startIndex = start;
    start += loop.walls.length;
  }
  return loops;
};

export type LoopNeighbours<W> = {
  prev: W | undefined;
  next: W | undefined;
  isFirst: boolean;
  isLast: boolean;
};

/** Neighbours within one loop, wrapping last↔first inside the loop only. */
export const neighboursInLoop = <W>(loopWalls: W[], index: number): LoopNeighbours<W> => {
  const count = loopWalls.length;
  return {
    prev: count > 0 ? loopWalls[(index - 1 + count) % count] : undefined,
    next: count > 0 ? loopWalls[(index + 1) % count] : undefined,
    isFirst: index === 0,
    isLast: index === count - 1
  };
};

/** Locate a wall's loop and neighbours by id (reducer / row UI). */
export const neighboursOf = <W extends LoopWall & { id: string }>(
  data: { walls: W[]; foundations: Foundation[] },
  wallId: string
): (LoopNeighbours<W> & { loop: WallLoop<W>; indexInLoop: number }) | null => {
  for (const loop of wallLoops(data)) {
    const indexInLoop = loop.walls.findIndex((wall) => wall.id === wallId);
    if (indexInLoop !== -1) {
      return { ...neighboursInLoop(loop.walls, indexInLoop), loop, indexInLoop };
    }
  }
  return null;
};
