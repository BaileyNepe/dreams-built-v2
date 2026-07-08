import {
  type FloorOutline,
  type PlacedCut,
  type Point
} from '@dreams-built/shared/src/jobsheet/engine/geometry';
import { formatCut } from '@dreams-built/shared/src/jobsheet/engine/format';
import { type FC } from 'react';
import { SECTION_COLORS, type SheetSection } from '../constants';

/**
 * Scale-true SVG of the slab: the perimeter polygon, the shutter boxing as
 * a band outside it, the rebate boxing inside, every cut labelled with its
 * length (shorts bold in the section colour, BLK dashed), wall numbers at
 * midpoints and a dashed red gap when the measurements don't close.
 *
 * All coordinates are millimetres; the viewBox does the scaling.
 */

const BAND_OFFSET_MM = 260;
const BAND_WIDTH_MM = 130;
const CUT_GAP_MM = 30;
const LABEL_OFFSET_MM = 620;
const NUMBER_OFFSET_MM = 1150;
const PADDING_MM = 1600;

const at = (start: Point, direction: Point, alongMm: number, normal: Point, offsetMm: number): Point => ({
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
  offsetMm: number;
  cuts: PlacedCut[];
  section: SheetSection;
  labelSide: 1 | -1;
}> = ({ wallStart, direction, normal, offsetMm, cuts, section, labelSide }) => (
  <>
    {cuts.map((placed, index) => {
      const from = at(wallStart, direction, placed.fromMm + CUT_GAP_MM, normal, offsetMm);
      const to = at(wallStart, direction, placed.toMm - CUT_GAP_MM, normal, offsetMm);
      const mid = at(
        wallStart,
        direction,
        (placed.fromMm + placed.toMm) / 2,
        normal,
        offsetMm + labelSide * LABEL_OFFSET_MM
      );
      const isShort = placed.cut.kind === 'short';
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
            strokeWidth={BAND_WIDTH_MM}
            strokeDasharray={placed.cut.kind === 'blk' ? '60 60' : undefined}
            opacity={isShort ? 1 : 0.55}
          />
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
export const FloorPlanSvg: FC<{ outline: FloorOutline; title?: string }> = ({
  outline,
  title = 'Floor plan'
}) => {
  const { bounds, walls, vertices, misclosureMm } = outline;
  const pad = PADDING_MM + BAND_OFFSET_MM + LABEL_OFFSET_MM;
  const viewBox = [
    bounds.minX - pad,
    bounds.minY - pad,
    bounds.maxX - bounds.minX + pad * 2,
    bounds.maxY - bounds.minY + pad * 2
  ].join(' ');

  const polygonPoints = vertices
    .slice(0, -1)
    .map((vertex) => `${vertex.x},${vertex.y}`)
    .join(' ');

  const [first] = vertices;
  const last = vertices[vertices.length - 1];

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={title}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      data-testid="floor-plan-svg"
    >
      <title>{title}</title>

      {walls.length > 0 && (
        <polygon
          points={polygonPoints}
          fill="#f2f0ec"
          stroke="#555"
          strokeWidth={25}
        />
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
        const mid = at(
          wall.start,
          wall.direction,
          wall.lengthMm / 2,
          wall.outwardNormal,
          NUMBER_OFFSET_MM + BAND_OFFSET_MM
        );
        return (
          <g key={wall.id}>
            {/* Shutter boxing outside the slab */}
            <CutBand
              wallStart={wall.start}
              direction={wall.direction}
              normal={wall.outwardNormal}
              offsetMm={BAND_OFFSET_MM}
              cuts={wall.shutterCuts}
              section="shutters"
              labelSide={1}
            />
            {/* Rebate boxing inside the slab */}
            {wall.rebateSegments.map((segment, index) => (
              <CutBand
                // Segments are positional.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                wallStart={wall.start}
                direction={wall.direction}
                normal={{ x: -wall.outwardNormal.x, y: -wall.outwardNormal.y }}
                offsetMm={BAND_OFFSET_MM}
                cuts={segment.cuts}
                section="rebate"
                labelSide={1}
              />
            ))}
            <text
              x={mid.x}
              y={mid.y}
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
    </svg>
  );
};
