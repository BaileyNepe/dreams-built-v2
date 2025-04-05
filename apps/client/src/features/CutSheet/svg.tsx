import { type FC, type JSX } from 'react';

type CornerType = 'left' | 'right' | 'straight';

export interface WallSegment {
  length: number;
  corner?: CornerType;
}

interface WallDrawingProps {
  segments: WallSegment[];
  strokeColor?: string;
  strokeWidth?: number;
}

const turnDirection = (currentDirection: number, corner?: CornerType): number => {
  switch (corner) {
    case 'left':
      return currentDirection + 90;
    case 'right':
      return currentDirection - 90;
    case 'straight':
    default:
      return currentDirection;
  }
};

/**
 * Draws the given segments in an SVG, starting from (0,0) heading east (0°).
 */
export const WallDrawing: FC<WallDrawingProps> = ({
  segments,
  strokeColor = 'green',
  strokeWidth = 5000
}) => {
  const lines: JSX.Element[] = [];

  // Track min/max to compute bounding box
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  // Starting point and direction
  let x = 0;
  let y = 0;
  let direction = 0; // 0° => east

  for (let i = 0; i < segments.length; i++) {
    const { length, corner } = segments[i];

    const rad = (Math.PI / 180) * direction;
    const x2 = x + length * Math.cos(rad);
    const y2 = y + length * Math.sin(rad);

    // Update bounding box
    minX = Math.min(minX, x, x2);
    maxX = Math.max(maxX, x, x2);
    minY = Math.min(minY, y, y2);
    maxY = Math.max(maxY, y, y2);

    lines.push(
      <line
        key={`segment-${i}`}
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );

    // Move forward
    x = x2;
    y = y2;
    // Turn
    direction = turnDirection(direction, corner);
  }

  // Compute overall width & height + some padding
  const padding = 1000;
  const width = maxX - minX + padding * 4;
  const height = maxY - minY + padding * 4;

  // The viewBox's (x, y) top-left corner:
  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;

  // Build the final viewBox string
  const viewBox = `${viewBoxX} ${viewBoxY} ${width} ${height}`;

  return (
    <svg
      width="800"
      height="600"
      viewBox={viewBox}
      style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
    >
      {lines}
    </svg>
  );
};
