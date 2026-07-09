import {
  type FloorOutline,
  type PlacedCut,
  type Point
} from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { formatCut } from '@dreams-built/shared/src/jobsheet/engine/format';
import { type JobSheetRules } from '@dreams-built/shared/src/jobsheet/types';
import { useEffect, useRef, useState, type FC } from 'react';
import { SECTION_COLORS, type SheetSection } from '../constants';

/**
 * Scale-true SVG of the slab and its boxing, drawn the way it sits on site:
 * the shutter band's inner face touches the slab edge (its thickness is the
 * real board width from the rules), the rebate strip sits inside the
 * perimeter at its real width, and cuts butt end-to-end with a tick mark at
 * each joint — no gaps, no floating bands. Overhangs run past corners
 * exactly as the boards do, and corners with an overlap/gap conflict are
 * flagged with a red marker (see CornerIssue in the engine).
 *
 * All coordinates are millimetres; the viewBox does the scaling.
 */

const LABEL_CLEARANCE_MM = 420;
const NUMBER_CLEARANCE_MM = 1000;
const PADDING_MM = 1800;

const at = (
  start: Point,
  direction: Point,
  alongMm: number,
  normal: Point,
  offsetMm: number
): Point => ({
  x: start.x + direction.x * alongMm + normal.x * offsetMm,
  y: start.y + direction.y * alongMm + normal.y * offsetMm
});

const cutColor = (cut: PlacedCut['cut'], section: SheetSection): string => {
  if (cut.kind === 'blk') return '#777';
  return SECTION_COLORS[section].header;
};

// million-ignore -- Million compiles SVG children with createElement (not NS)
const CutBand: FC<{
  wallStart: Point;
  direction: Point;
  normal: Point;
  /** Band centreline offset along the normal (signed). */
  centreOffsetMm: number;
  /** Physical band thickness (board / strip width). */
  thicknessMm: number;
  /** Where cut labels go, offset along the normal (signed). */
  labelOffsetMm: number;
  /** How deep a perpendicular BLK spans (the slab step depth). */
  stepDepthMm: number;
  cuts: PlacedCut[];
  section: SheetSection;
}> = ({
  wallStart,
  direction,
  normal,
  centreOffsetMm,
  thicknessMm,
  labelOffsetMm,
  stepDepthMm,
  cuts,
  section
}) => (
  <>
    {cuts.map((placed, index) => {
      const inset = placed.insetMm ?? 0;
      const from = at(wallStart, direction, placed.fromMm, normal, centreOffsetMm - inset);
      const to = at(wallStart, direction, placed.toMm, normal, centreOffsetMm - inset);
      const mid = at(
        wallStart,
        direction,
        (placed.fromMm + placed.toMm) / 2,
        normal,
        labelOffsetMm - inset
      );
      const isShort = placed.cut.kind === 'short';

      // BLK caps sit ACROSS the channel (perpendicular): a 65-thick block
      // spanning the band width at the step face.
      if (placed.perpendicular) {
        const station = (placed.fromMm + placed.toMm) / 2;
        // The BLK is a rebate-width block: it spans exactly the slab step,
        // from the outer edge line down to the inset line.
        const inner = at(wallStart, direction, station, normal, -stepDepthMm);
        const outer = at(wallStart, direction, station, normal, 0);
        const labelAt = at(wallStart, direction, station, normal, labelOffsetMm);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <g key={index}>
            <line
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#777"
              strokeWidth={placed.toMm - placed.fromMm}
            />
            <text
              x={labelAt.x}
              y={labelAt.y}
              fontSize={200}
              fontWeight={600}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#555"
            >
              BLK
            </text>
          </g>
        );
      }

      // Joint tick: a line across the band where this cut butts the next.
      const jointInner = at(
        wallStart,
        direction,
        placed.toMm,
        normal,
        centreOffsetMm - thicknessMm / 2
      );
      const jointOuter = at(
        wallStart,
        direction,
        placed.toMm,
        normal,
        centreOffsetMm + thicknessMm / 2
      );

      return (
        // Cuts are positional along the run.
        // eslint-disable-next-line react/no-array-index-key
        <g key={index}>
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={cutColor(placed.cut, section)}
            strokeWidth={thicknessMm}
            strokeDasharray={placed.cut.kind === 'blk' ? '60 60' : undefined}
            opacity={isShort ? 0.95 : 0.7}
          />
          {index < cuts.length - 1 && (
            <line
              x1={jointInner.x}
              y1={jointInner.y}
              x2={jointOuter.x}
              y2={jointOuter.y}
              stroke="#00000090"
              strokeWidth={22}
            />
          )}
          <text
            x={mid.x}
            y={mid.y}
            fontSize={230}
            fontWeight={isShort ? 700 : 400}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isShort ? cutColor(placed.cut, section) : '#333'}
          >
            {formatCut(placed.cut)}
          </text>
        </g>
      );
    })}
  </>
);

// million-ignore -- Million compiles SVG children with createElement (not NS)
export const FloorPlanSvg: FC<{
  outline: FloorOutline;
  rules: JobSheetRules;
  title?: string;
  /** Drag along a wall to add an opening spanning the dragged range. */
  onDrawSpan?: (wallId: string, fromMm: number, toMm: number) => void;
}> = ({ outline, rules, title = 'Floor plan', onDrawSpan }) => {
  const { bounds, walls, loops, cornerIssues } = outline;

  // Scroll to zoom (non-passive listener so the page doesn't scroll too).
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null
  );
  const [spanDraw, setSpanDraw] = useState<{
    wallId: string;
    startMm: number;
    currentMm: number;
  } | null>(null);
  // Click a wall number to spotlight that wall's shutters and rebates.
  const [focusWallId, setFocusWallId] = useState<string | null>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((z) =>
        Math.min(10, Math.max(0.2, z * (event.deltaY < 0 ? 1.15 : 1 / 1.15)))
      );
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);
  const shutterThickness = rules.shutterThicknessMm;
  const rebateWidth = rules.rebateWidthMm;

  const pad = PADDING_MM + shutterThickness + LABEL_CLEARANCE_MM + NUMBER_CLEARANCE_MM;
  const fullWidth = bounds.maxX - bounds.minX + pad * 2;
  const fullHeight = bounds.maxY - bounds.minY + pad * 2;
  const centreX = (bounds.minX + bounds.maxX) / 2;
  const centreY = (bounds.minY + bounds.maxY) / 2;
  const viewWidth = fullWidth / zoom;
  const viewHeight = fullHeight / zoom;
  const viewX = centreX + pan.x - viewWidth / 2;
  const viewY = centreY + pan.y - viewHeight / 2;
  const viewBox = [viewX, viewY, viewWidth, viewHeight].join(' ');

  /** Pixels per mm under preserveAspectRatio "meet" (letterboxed when capped). */
  const pxPerMm = (rect: DOMRect): number =>
    Math.min(rect.width / viewWidth, rect.height / viewHeight);

  /** Project a pointer event onto a wall, in mm from its start (10mm snap). */
  const toWallMm = (
    wall: FloorOutline['walls'][number],
    event: React.PointerEvent
  ): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const scale = pxPerMm(rect);
    const x =
      viewX + (event.clientX - rect.left - (rect.width - viewWidth * scale) / 2) / scale;
    const y =
      viewY + (event.clientY - rect.top - (rect.height - viewHeight * scale) / 2) / scale;
    const t =
      (x - wall.start.x) * wall.direction.x + (y - wall.start.y) * wall.direction.y;
    return Math.max(0, Math.min(wall.lengthMm, Math.round(t / 10) * 10));
  };

  // Drag to pan (mm per pixel derives from the current viewBox).
  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    // Text elements (wall numbers) keep their click behaviour.
    if ((event.target as Element).tagName === 'text') return;
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (spanDraw) {
      const wall = walls.find((w) => w.id === spanDraw.wallId);
      if (wall) setSpanDraw({ ...spanDraw, currentMm: toWallMm(wall, event) });
      return;
    }
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || !svg) return;
    const mmPerPx = 1 / pxPerMm(svg.getBoundingClientRect());
    setPan({
      x: drag.panX - (event.clientX - drag.x) * mmPerPx,
      y: drag.panY - (event.clientY - drag.y) * mmPerPx
    });
  };
  const onPointerUp = () => {
    if (spanDraw && onDrawSpan) {
      const fromMm = Math.min(spanDraw.startMm, spanDraw.currentMm);
      const toMm = Math.max(spanDraw.startMm, spanDraw.currentMm);
      if (toMm - fromMm >= 100) onDrawSpan(spanDraw.wallId, fromMm, toMm);
    }
    setSpanDraw(null);
    dragRef.current = null;
  };

  // Slab outline with inset steps: across a BLK-capped bare span the edge
  // steps in by one rebate width (the BLKs form the step faces). A bare
  // span touching a wall end IS the corner — the edge stays on the frame
  // line there instead of stepping back out to the nominal brick line.
  // Detached foundations are separate closed subpaths of the one path.
  const loopSubpath = (loopWalls: typeof walls) =>
    loopWalls.length
      ? `${loopWalls
          .map((wall, index) => {
            const pt = (alongMm: number, inMm: number) =>
              at(wall.start, wall.direction, alongMm, wall.outwardNormal, -inMm);
            const parts: string[] = [];
            const move = index === 0 ? 'M' : 'L';
            const startsBare = wall.insets.some((inset) => inset.fromMm <= 0);
            const start = startsBare ? pt(0, rebateWidth) : wall.start;
            parts.push(`${move} ${start.x} ${start.y}`);
            for (const inset of wall.insets) {
              if (inset.fromMm > 0) {
                const a = pt(inset.fromMm, 0);
                const b = pt(inset.fromMm, rebateWidth);
                parts.push(`L ${a.x} ${a.y} L ${b.x} ${b.y}`);
              }
              const c = pt(Math.min(inset.toMm, wall.lengthMm), rebateWidth);
              parts.push(`L ${c.x} ${c.y}`);
              if (inset.toMm < wall.lengthMm) {
                const d = pt(inset.toMm, 0);
                parts.push(`L ${d.x} ${d.y}`);
              }
            }
            const endsBare = wall.insets.some((inset) => inset.toMm >= wall.lengthMm);
            if (!endsBare) parts.push(`L ${wall.end.x} ${wall.end.y}`);
            return parts.join(' ');
          })
          .join(' ')} Z`
      : '';
  const slabPath = loops
    .map((loop) => loopSubpath(loop.walls))
    .filter((d) => d !== '')
    .join(' ');

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      role="img"
      aria-label={title}
      style={{
        width: '100%',
        height: 'auto',
        // Tall floors otherwise render taller than the screen with no way
        // to fit them: cap to the viewport and letterbox.
        maxHeight: '75vh',
        display: 'block',
        cursor: dragRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
      data-testid="floor-plan-svg"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <title>{title}</title>

      {walls.length > 0 && (
        <path d={slabPath} fill="#f2f0ec" stroke="#555" strokeWidth={20} />
      )}

      {loops
        .filter((loop) => loop.misclosureMm > 1 && loop.vertices.length > 1)
        .map((loop) => {
          const [first] = loop.vertices;
          const last = loop.vertices[loop.vertices.length - 1];
          return (
            <line
              key={loop.foundationId}
              x1={last.x}
              y1={last.y}
              x2={first.x}
              y2={first.y}
              stroke="#d32f2f"
              strokeWidth={40}
              strokeDasharray="180 120"
              data-testid="misclosure-line"
            />
          );
        })}

      {walls.map((wall) => {
        const numberPos = at(
          wall.start,
          wall.direction,
          wall.lengthMm / 2,
          wall.outwardNormal,
          shutterThickness + LABEL_CLEARANCE_MM + NUMBER_CLEARANCE_MM
        );
        const isDimmed = focusWallId !== null && focusWallId !== wall.id;
        const preview =
          spanDraw && spanDraw.wallId === wall.id
            ? {
                fromMm: Math.min(spanDraw.startMm, spanDraw.currentMm),
                toMm: Math.max(spanDraw.startMm, spanDraw.currentMm)
              }
            : null;
        return (
          <g key={wall.id} opacity={isDimmed ? 0.12 : 1}>
            {onDrawSpan && (
              /* Wide invisible hit-line: drag along the wall to add an opening. */
              <line
                x1={wall.start.x}
                y1={wall.start.y}
                x2={wall.end.x}
                y2={wall.end.y}
                stroke="transparent"
                strokeWidth={520}
                style={{ cursor: 'crosshair' }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setSpanDraw({
                    wallId: wall.id,
                    startMm: toWallMm(wall, event),
                    currentMm: toWallMm(wall, event)
                  });
                }}
              >
                <title>Drag along this wall to add an opening</title>
              </line>
            )}
            {preview && (
              <>
                <line
                  x1={at(wall.start, wall.direction, preview.fromMm, wall.outwardNormal, 0).x}
                  y1={at(wall.start, wall.direction, preview.fromMm, wall.outwardNormal, 0).y}
                  x2={at(wall.start, wall.direction, preview.toMm, wall.outwardNormal, 0).x}
                  y2={at(wall.start, wall.direction, preview.toMm, wall.outwardNormal, 0).y}
                  stroke="#ff9800"
                  strokeWidth={160}
                  opacity={0.8}
                />
                <text
                  x={at(wall.start, wall.direction, (preview.fromMm + preview.toMm) / 2, wall.outwardNormal, -520).x}
                  y={at(wall.start, wall.direction, (preview.fromMm + preview.toMm) / 2, wall.outwardNormal, -520).y}
                  fontSize={260}
                  fontWeight={700}
                  textAnchor="middle"
                  fill="#e65100"
                >
                  {preview.toMm - preview.fromMm}
                </text>
              </>
            )}
            {/* Shutter boxing: inner face in contact with the slab edge. */}
            <CutBand
              wallStart={wall.start}
              direction={wall.direction}
              normal={wall.outwardNormal}
              centreOffsetMm={shutterThickness / 2}
              thicknessMm={shutterThickness}
              labelOffsetMm={shutterThickness + LABEL_CLEARANCE_MM}
              stepDepthMm={rebateWidth}
              cuts={wall.shutterCuts}
              section="shutters"
            />
            {/* Rebate strip: sits inside the perimeter against the edge. */}
            {wall.rebateSegments.map((segment, index) => (
              <CutBand
                // Segments are positional.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                wallStart={wall.start}
                direction={wall.direction}
                normal={wall.outwardNormal}
                centreOffsetMm={-rebateWidth / 2}
                thicknessMm={rebateWidth}
                labelOffsetMm={-(rebateWidth + LABEL_CLEARANCE_MM)}
                stepDepthMm={rebateWidth}
                cuts={segment.cuts}
                section="rebate"
              />
            ))}
            <text
              x={numberPos.x}
              y={numberPos.y}
              fontSize={340}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={focusWallId === wall.id ? '#d32f2f' : '#222'}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() =>
                setFocusWallId((current) => (current === wall.id ? null : wall.id))
              }
            >
              {wall.number}
              {wall.isGarageDoorWall ? ' ⌂' : ''}
            </text>
          </g>
        );
      })}

      {/* Corner conflicts: two boards in the same space, or a gap. */}
      {cornerIssues.map((issue) => (
        <g key={`${issue.kind}-${issue.wallNumber}`} data-testid="corner-issue-marker">
          <circle
            cx={issue.at.x}
            cy={issue.at.y}
            r={220}
            fill="none"
            stroke="#d32f2f"
            strokeWidth={50}
          />
          <title>{issue.message}</title>
        </g>
      ))}
    </svg>
  );
};
