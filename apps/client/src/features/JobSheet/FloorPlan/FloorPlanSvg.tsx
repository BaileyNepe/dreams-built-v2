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
  cuts: PlacedCut[];
  section: SheetSection;
}> = ({
  wallStart,
  direction,
  normal,
  centreOffsetMm,
  thicknessMm,
  labelOffsetMm,
  cuts,
  section
}) => (
  <>
    {cuts.map((placed, index) => {
      const from = at(wallStart, direction, placed.fromMm, normal, centreOffsetMm);
      const to = at(wallStart, direction, placed.toMm, normal, centreOffsetMm);
      const mid = at(
        wallStart,
        direction,
        (placed.fromMm + placed.toMm) / 2,
        normal,
        labelOffsetMm
      );
      const isShort = placed.cut.kind === 'short';

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
}> = ({ outline, rules, title = 'Floor plan' }) => {
  const { bounds, walls, vertices, misclosureMm, cornerIssues } = outline;

  // Scroll to zoom (non-passive listener so the page doesn't scroll too).
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((z) => Math.min(10, Math.max(1, z * (event.deltaY < 0 ? 1.15 : 1 / 1.15))));
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
  const viewBox = [
    centreX - fullWidth / zoom / 2,
    centreY - fullHeight / zoom / 2,
    fullWidth / zoom,
    fullHeight / zoom
  ].join(' ');

  const polygonPoints = vertices
    .slice(0, -1)
    .map((vertex) => `${vertex.x},${vertex.y}`)
    .join(' ');

  const [first] = vertices;
  const last = vertices[vertices.length - 1];

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      role="img"
      aria-label={title}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      data-testid="floor-plan-svg"
    >
      <title>{title}</title>

      {walls.length > 0 && (
        <polygon points={polygonPoints} fill="#f2f0ec" stroke="#555" strokeWidth={20} />
      )}

      {misclosureMm > 1 && (
        <line
          x1={last.x}
          y1={last.y}
          x2={first.x}
          y2={first.y}
          stroke="#d32f2f"
          strokeWidth={40}
          strokeDasharray="180 120"
          data-testid="misclosure-line"
        />
      )}

      {walls.map((wall) => {
        const numberPos = at(
          wall.start,
          wall.direction,
          wall.lengthMm / 2,
          wall.outwardNormal,
          shutterThickness + LABEL_CLEARANCE_MM + NUMBER_CLEARANCE_MM
        );
        return (
          <g key={wall.id}>
            {/* Shutter boxing: inner face in contact with the slab edge. */}
            <CutBand
              wallStart={wall.start}
              direction={wall.direction}
              normal={wall.outwardNormal}
              centreOffsetMm={shutterThickness / 2}
              thicknessMm={shutterThickness}
              labelOffsetMm={shutterThickness + LABEL_CLEARANCE_MM}
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
              fill="#222"
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
