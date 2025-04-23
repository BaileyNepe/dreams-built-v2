import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  type ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import styled from 'styled-components';

// Standard sizes for shutters and rebates
const STANDARD_SIZES = [4800, 4200, 3600, 3000, 2400, 1800, 1200, 600];

// Wall join types
type JoinType = '90-outward' | '90-inward' | '270-outward' | '270-inward' | 'straight';

interface WallData {
  id: string;
  length: number;
  shutters: number[];
  rebates: number[];
  joinType: JoinType;
  isInset: boolean;
}

interface RecessData {
  id: string;
  type: 'shower' | 'garage' | 'joinery';
  width: number;
  height: number;
  depth: number;
  location: string;
  notes: string;
}

// Container for the calculator with proper spacing
const CalculatorContainer = styled(Box)`
  padding: 24px;
`;

// Summary table styling
const SummaryContainer = styled(Box)`
  margin-bottom: 24px;
  margin-top: 24px;
`;

// Canvas for floor plan drawing
const FloorPlanCanvas = styled.canvas`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  height: 700px;
  width: 100%;
`;

// Table styling to match the spreadsheet example
const ShutterRebateTable = styled(TableContainer)`
  margin-bottom: 24px;

  .MuiTableCell-head {
    background-color: #f0f0f0;
    font-weight: bold;
  }

  .shutter-column {
    background-color: #f8e8ff;
  }

  .rebate-column {
    background-color: #e6ffe6;
  }

  .blk-cell {
    background-color: #e0e0e0;
  }
`;

// Calculate shutters and rebates for a given length
const calculateSizes = (length: number, isInset: boolean) => {
  const shutters: number[] = [];
  const rebates: number[] = [];

  // Logic for calculating shutters
  let remainingShutterLength = length;

  // For inset walls, we need exact measurements
  if (isInset) {
    // Find exact fits using standard sizes
    while (remainingShutterLength > 0) {
      // Try to find an exact standard size
      let exactSize: number | undefined;
      for (const size of STANDARD_SIZES) {
        if (size === remainingShutterLength) {
          exactSize = size;
          break;
        }
      }

      if (exactSize) {
        shutters.push(exactSize);
        remainingShutterLength = 0;
      } else {
        // Find the largest standard size that fits
        let largestSize: number | undefined;
        for (const size of STANDARD_SIZES) {
          if (size < remainingShutterLength) {
            largestSize = size;
            break;
          }
        }

        if (largestSize) {
          shutters.push(largestSize);
          remainingShutterLength -= largestSize;
        } else {
          // If no standard size fits, use the remaining length
          shutters.push(remainingShutterLength);
          remainingShutterLength = 0;
        }
      }
    }
  } else {
    // Regular walls can have overhangs
    while (remainingShutterLength > 0) {
      // Find the largest standard size that fits
      let sizeToUse = remainingShutterLength;
      for (const size of STANDARD_SIZES) {
        if (size <= remainingShutterLength) {
          sizeToUse = size;
          break;
        }
      }
      shutters.push(sizeToUse);
      remainingShutterLength -= sizeToUse;
    }
  }

  // Logic for calculating rebates (need to be exact)
  let remainingRebateLength = length;
  while (remainingRebateLength > 0) {
    // Find the largest standard size that fits
    let sizeToUse = remainingRebateLength;
    for (const size of STANDARD_SIZES) {
      if (size <= remainingRebateLength) {
        sizeToUse = size;
        break;
      }
    }
    rebates.push(sizeToUse);
    remainingRebateLength -= sizeToUse;
  }

  return { shutters, rebates };
};

export const FoundationCalculator: FC = () => {
  // State for walls and recesses
  const [walls, setWalls] = useState<WallData[]>([]);
  const [recesses, setRecesses] = useState<RecessData[]>([]);

  // State for summary
  const [shutterSummary, setShutterSummary] = useState<Record<number, number>>({});
  const [rebateSummary, setRebateSummary] = useState<Record<number, number>>({});

  // Canvas panning and zooming state
  const [zoom, setZoom] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees

  // Shutter properties - increased default width for better visibility
  const [shutterWidth, setShutterWidth] = useState(200); // Default width (thickness) of shutters

  // Reference for canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add a new wall
  const addWall = useCallback(() => {
    const newWall: WallData = {
      id: `wall-${Date.now()}`,
      length: 0,
      shutters: [],
      rebates: [],
      joinType: '90-outward' as JoinType,
      isInset: false
    };
    setWalls((prev) => [...prev, newWall]);
  }, []);

  // Remove a wall
  const removeWall = (id: string) => {
    setWalls(walls.filter((wall) => wall.id !== id));
  };

  // Add a new recess
  const addRecess = (type: 'shower' | 'garage' | 'joinery') => {
    const newRecess: RecessData = {
      id: `recess-${Date.now()}`,
      type,
      width: 0,
      height: 0,
      depth: 0,
      location: '',
      notes: ''
    };

    setRecesses([...recesses, newRecess]);
  };

  // Remove a recess
  const removeRecess = (id: string) => {
    setRecesses(recesses.filter((recess) => recess.id !== id));
  };

  // Update wall length
  const updateWallLength = (id: string, length: number) => {
    setWalls(
      walls.map((wall) => {
        if (wall.id === id) {
          // Calculate shutters and rebates based on length and inset status
          const { shutters, rebates } = calculateSizes(length, wall.isInset);
          return { ...wall, length, shutters, rebates };
        }
        return wall;
      })
    );
  };

  // Update wall join type
  const updateWallJoinType = (id: string, joinType: JoinType) => {
    setWalls(
      walls.map((wall) => {
        if (wall.id === id) {
          return { ...wall, joinType };
        }
        return wall;
      })
    );
  };

  // Toggle inset status
  const toggleInsetWall = (id: string) => {
    setWalls(
      walls.map((wall) => {
        if (wall.id === id) {
          const isInset = !wall.isInset;
          // Recalculate shutters based on new inset status
          const { shutters, rebates } = calculateSizes(wall.length, isInset);
          return { ...wall, isInset, shutters, rebates };
        }
        return wall;
      })
    );
  };

  // Update recess data
  const updateRecess = (id: string, field: keyof RecessData, value: unknown) => {
    setRecesses(
      recesses.map((recess) => {
        if (recess.id === id) {
          return { ...recess, [field]: value };
        }
        return recess;
      })
    );
  };

  // Initialize with one wall
  useEffect(() => {
    if (walls.length === 0) {
      // Create walls based on the provided measurements
      const houseWalls = [
        {
          id: `wall-${Date.now()}-1`,
          length: 6420,
          shutters: [4800, 1200, 420],
          rebates: [4800, 1200, 420],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-2`,
          length: 11700,
          shutters: [4800, 4800, 1800, 300],
          rebates: [4800, 4800, 1800, 300],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-3`,
          length: 6420,
          shutters: [4800, 1200, 420],
          rebates: [4800, 1200, 420],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-4`,
          length: 3640,
          shutters: [3600, 40],
          rebates: [3600, 40],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-5`,
          length: 1380,
          shutters: [1200, 180],
          rebates: [1200, 180],
          joinType: '270-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-6`,
          length: 560,
          shutters: [560],
          rebates: [560],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-7`,
          length: 7990,
          shutters: [4800, 3000, 190],
          rebates: [4800, 3000, 190],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-8`,
          length: 1600,
          shutters: [1200, 400],
          rebates: [1200, 400],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-9`,
          length: 4310,
          shutters: [4200, 110],
          rebates: [4200, 110],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-10`,
          length: 3090,
          shutters: [3000, 90],
          rebates: [3000, 90],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-11`,
          length: 450,
          shutters: [450],
          rebates: [450],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-12`,
          length: 4040,
          shutters: [3600, 440],
          rebates: [3600, 440],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-13`,
          length: 450,
          shutters: [450],
          rebates: [450],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-14`,
          length: 3090,
          shutters: [3000, 90],
          rebates: [3000, 90],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-15`,
          length: 4310,
          shutters: [4200, 110],
          rebates: [4200, 110],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-16`,
          length: 830,
          shutters: [600, 230],
          rebates: [600, 230],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-17`,
          length: 5780,
          shutters: [4800, 600, 380],
          rebates: [4800, 600, 380],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-18`,
          length: 1680,
          shutters: [1200, 480],
          rebates: [1200, 480],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-19`,
          length: 2210,
          shutters: [1800, 410],
          rebates: [1800, 410],
          joinType: '90-outward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-20`,
          length: 680,
          shutters: [600, 80],
          rebates: [600, 80],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-21`,
          length: 1380,
          shutters: [1200, 180],
          rebates: [1200, 180],
          joinType: '90-inward' as JoinType,
          isInset: false
        },
        {
          id: `wall-${Date.now()}-22`,
          length: 3190,
          shutters: [3000, 190],
          rebates: [3000, 190],
          joinType: '90-outward' as JoinType,
          isInset: false
        }
      ];
      setWalls(houseWalls);

      // Add sample recesses
      const sampleRecesses = [
        {
          id: `recess-${Date.now()}-1`,
          type: 'garage' as const,
          width: 2400,
          height: 2100,
          depth: 200,
          location: 'Wall 1',
          notes: 'Main garage door'
        },
        {
          id: `recess-${Date.now()}-2`,
          type: 'shower' as const,
          width: 1000,
          height: 1000,
          depth: 50,
          location: 'Wall 3',
          notes: 'Master bathroom'
        },
        {
          id: `recess-${Date.now()}-3`,
          type: 'joinery' as const,
          width: 1200,
          height: 1000,
          depth: 100,
          location: 'Wall 2',
          notes: 'Living room window'
        }
      ];
      setRecesses(sampleRecesses);
    }
  }, []);

  // Handle rotation by 90 degrees
  const rotateCanvas = (direction: 'clockwise' | 'counterclockwise') => {
    setRotation((prevRotation) => {
      if (direction === 'clockwise') {
        return (prevRotation + 90) % 360;
      }
      return (prevRotation - 90 + 360) % 360;
    });
  };

  // Handle mouse wheel events for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prevZoom) => Math.max(0.1, Math.min(10, prevZoom + delta)));
  }, []);

  // Handle mouse down event for starting drag
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      // Only left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'grabbing';
      }
    }
  }, []);

  // Handle mouse move event for dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      // Transform dx and dy based on the current rotation angle for intuitive dragging
      let transformedDx = dx;
      let transformedDy = dy;

      // Apply rotation transform to pan coordinates
      // This ensures dragging feels natural at any rotation angle
      const rotationRad = (rotation * Math.PI) / 180;
      transformedDx = dx * Math.cos(rotationRad) + dy * Math.sin(rotationRad);
      transformedDy = -dx * Math.sin(rotationRad) + dy * Math.cos(rotationRad);

      setPanPosition((prevPos) => ({
        x: prevPos.x + transformedDx,
        y: prevPos.y + transformedDy
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, rotation]
  );

  // Handle mouse up event for ending drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'grab';
    }
  }, []);

  // Add event listeners for canvas interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel as EventListener);
    canvas.addEventListener('mousedown', handleMouseDown as EventListener);
    window.addEventListener('mousemove', handleMouseMove as EventListener);
    window.addEventListener('mouseup', handleMouseUp as EventListener);

    return () => {
      canvas.removeEventListener('wheel', handleWheel as EventListener);
      canvas.removeEventListener('mousedown', handleMouseDown as EventListener);
      window.removeEventListener('mousemove', handleMouseMove as EventListener);
      window.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Draw the floor plan
  const drawFloorPlan = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get canvas dimensions and set scale
    const { width } = canvas;
    const { height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply zoom, pan, and rotation transformations
    ctx.save();

    // 1. Move to center of canvas for rotation
    ctx.translate(width / 2, height / 2);

    // 2. Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // 3. Apply zoom
    ctx.scale(zoom, zoom);

    // 4. Apply panning and return to original reference
    ctx.translate(panPosition.x / zoom, panPosition.y / zoom);
    ctx.translate(-width / 2, -height / 2);

    // Skip if no walls
    if (walls.length === 0) {
      ctx.restore();
      return;
    }

    // Calculate total perimeter to determine scale
    const totalLength = walls.reduce((sum, wall) => sum + wall.length, 0);
    if (totalLength === 0) {
      ctx.restore();
      return;
    }

    // Find maximum wall length and room dimensions
    let maxWallLength = 0;
    walls.forEach((wall) => {
      if (wall.length > maxWallLength) maxWallLength = wall.length;
    });

    // Calculate scale to fit canvas (leaving margin)
    const margin = 100; // Larger margin for better visibility
    const drawingWidth = width - margin * 2;
    const drawingHeight = height - margin * 2;

    // Calculate aspect ratio of the walls layout
    // This approximation helps display the floor plan with better proportions
    let estimatedWidth = 0;
    let estimatedHeight = 0;
    let x = 0;
    let y = 0;
    let direction = 0;

    walls.forEach((wall) => {
      const len = wall.length;
      switch (direction % 4) {
        case 0: // right
          x += len;
          estimatedWidth = Math.max(estimatedWidth, x);
          break;
        case 1: // down
          y += len;
          estimatedHeight = Math.max(estimatedHeight, y);
          break;
        case 2: // left
          x -= len;
          break;
        case 3: // up
          y -= len;
          break;
      }

      // Update direction based on join type
      if (wall.joinType === '90-outward' || wall.joinType === '270-inward') {
        direction++;
      } else if (wall.joinType === '90-inward' || wall.joinType === '270-outward') {
        direction += 3; // -1 in modulo 4
      }
      // Straight keeps the same direction
    });

    // Find the min x, y values for better centering
    let minX = 0;
    let minY = 0;
    x = 0;
    y = 0;
    direction = 0;

    // First pass to find boundaries
    walls.forEach((wall) => {
      const len = wall.length;
      let newX = x;
      let newY = y;

      switch (direction % 4) {
        case 0: // right
          newX += len;
          break;
        case 1: // down
          newY += len;
          break;
        case 2: // left
          newX -= len;
          minX = Math.min(minX, newX);
          break;
        case 3: // up
          newY -= len;
          minY = Math.min(minY, newY);
          break;
      }

      x = newX;
      y = newY;

      // Update direction based on join type
      if (wall.joinType === '90-outward' || wall.joinType === '270-inward') {
        direction++;
      } else if (wall.joinType === '90-inward' || wall.joinType === '270-outward') {
        direction += 3; // -1 in modulo 4
      }
    });

    // Adjust estimates to include negative coordinates
    estimatedWidth -= minX;
    estimatedHeight -= minY;

    // Use room dimensions to calculate better scale
    const roomWidth = Math.max(estimatedWidth, 1000); // Ensure minimum size
    const roomHeight = Math.max(estimatedHeight, 1000);

    // Calculate scale based on available space and room dimensions
    const scaleX = drawingWidth / roomWidth;
    const scaleY = drawingHeight / roomHeight;
    const scale = Math.min(scaleX, scaleY) * 0.8; // Use 80% of available space

    // Starting position (center of canvas with offset based on room dimensions)
    x = width / 2 - (estimatedWidth * scale) / 2 - minX * scale;
    y = height / 2 - (estimatedHeight * scale) / 2 - minY * scale;

    // Store all points for drawing the outline
    const points: [number, number][] = [[x, y]];

    // Calculate all wall end points first
    walls.forEach((wall, index) => {
      if (wall.length === 0) return;

      // Calculate end point based on direction
      let newX = x;
      let newY = y;
      const scaledLength = wall.length * scale; // Calculate pixel length

      // Determine end point based on current direction
      switch (direction) {
        case 0: // right
          newX += scaledLength;
          break;
        case 1: // down
          newY += scaledLength;
          break;
        case 2: // left
          newX -= scaledLength;
          break;
        case 3: // up
          newY -= scaledLength;
          break;
      }

      // Save this point
      points.push([newX, newY]);

      // Update position for next wall
      x = newX;
      y = newY;

      // Change direction based on join type
      if (index < walls.length - 1) {
        switch (wall.joinType) {
          case '90-outward':
            direction = (direction + 1) % 4;
            break;
          case '90-inward':
            direction = (direction + 3) % 4; // -1 in modulo 4
            break;
          case '270-outward':
            direction = (direction + 3) % 4; // -1 in modulo 4
            break;
          case '270-inward':
            direction = (direction + 1) % 4;
            break;
          case 'straight':
            // Direction remains the same
            break;
        }
      }
    });

    // Draw foundation outline with thicker line
    ctx.beginPath();
    if (points.length > 0) {
      const [x0, y0] = points[0];
      ctx.moveTo(x0, y0);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = points[i];
        ctx.lineTo(px, py);
      }
    }

    // Close the path if we have at least 3 walls
    if (points.length >= 3) {
      ctx.closePath();
    }

    // Set line style and stroke for foundation outline
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Fill with light color
    ctx.fillStyle = 'rgba(240, 240, 240, 0.4)';
    ctx.fill();

    // Reset for drawing
    const [wallStartX, wallStartY] = points[0];
    x = wallStartX;
    y = wallStartY;
    direction = 0;

    // Draw shutters first, then walls
    // Draw shutters along the walls
    walls.forEach((wall, index) => {
      if (wall.length === 0 || index >= points.length - 1 || wall.shutters.length === 0) {
        return;
      }

      const [wallX1, wallY1] = points[index];
      const [wallX2, wallY2] = points[index + 1];

      // Calculate the direction vector of the wall
      const dx = wallX2 - wallX1;
      const dy = wallY2 - wallY1;
      const wallLength = Math.sqrt(dx * dx + dy * dy);

      // Calculate the unit vectors for the wall direction and perpendicular (outward)
      const unitX = dx / wallLength;
      const unitY = dy / wallLength;

      // Perpendicular direction (outward from the foundation)
      const perpX = -unitY; // Rotate 90 degrees counterclockwise
      const perpY = unitX;

      // The shutterWidth is in mm, need to convert to canvas pixels using scale
      const scaledShutterWidth = shutterWidth * scale;

      // Track position along the wall
      let currentPos = 0;

      // Draw each shutter for this wall
      wall.shutters.forEach((shutterLength) => {
        if (shutterLength === 0) return;

        // Calculate the positions for this shutter
        const shutterStart = currentPos;
        const shutterEnd = currentPos + shutterLength * scale;

        // Calculate the corner points of the shutter rectangle
        const innerStartX = wallX1 + shutterStart * unitX;
        const innerStartY = wallY1 + shutterStart * unitY;

        const innerEndX = wallX1 + shutterEnd * unitX;
        const innerEndY = wallY1 + shutterEnd * unitY;

        const outerStartX = innerStartX + scaledShutterWidth * perpX;
        const outerStartY = innerStartY + scaledShutterWidth * perpY;

        const outerEndX = innerEndX + scaledShutterWidth * perpX;
        const outerEndY = innerEndY + scaledShutterWidth * perpY;

        // Draw the shutter rectangle
        ctx.beginPath();
        ctx.moveTo(innerStartX, innerStartY);
        ctx.lineTo(innerEndX, innerEndY);
        ctx.lineTo(outerEndX, outerEndY);
        ctx.lineTo(outerStartX, outerStartY);
        ctx.closePath();

        // Style and fill the shutter with more vibrant colors
        ctx.fillStyle = 'rgba(100, 100, 230, 0.8)'; // More vibrant blue
        ctx.strokeStyle = '#3333cc'; // Darker blue outline
        ctx.lineWidth = 1.5; // Thicker outline
        ctx.fill();
        ctx.stroke();

        // Update the current position for the next shutter
        currentPos = shutterEnd;
      });
    });

    // Now draw walls with labels
    // Draw walls with labels
    walls.forEach((wall, index) => {
      if (wall.length === 0 || index >= points.length - 1) return;

      const [startX, startY] = points[index];
      const [endX, endY] = points[index + 1];
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Add wall label
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial'; // Larger font for better readability
      ctx.textAlign = 'center'; // Center text for cleaner labels

      // Counter-rotate text to keep it readable regardless of canvas rotation
      ctx.translate(midX, midY);
      ctx.rotate(-(rotation * Math.PI) / 180);

      // Position label based on direction
      let labelOffsetX = 0;
      let labelOffsetY = -25; // Default offset upward

      // Adjust offset direction based on wall direction and rotation
      switch ((direction + Math.round(rotation / 90)) % 4) {
        case 0: // right
          labelOffsetY = -25;
          break;
        case 1: // down
          labelOffsetX = 25;
          labelOffsetY = 0;
          break;
        case 2: // left
          labelOffsetY = 25;
          break;
        case 3: // up
          labelOffsetX = -25;
          labelOffsetY = 0;
          break;
      }

      // Add wall number and length
      ctx.fillText(`Wall ${index + 1}: ${wall.length}`, labelOffsetX, labelOffsetY);

      // Add inset indicator if applicable
      if (wall.isInset) {
        ctx.fillStyle = 'red'; // Make P indicator more visible
        ctx.fillText('P', labelOffsetX, labelOffsetY + 20);
      }

      ctx.restore();

      // Draw dimension line
      ctx.save();
      ctx.strokeStyle = '#666'; // Darker for better visibility
      ctx.lineWidth = 1.5; // Thicker dimension lines
      ctx.setLineDash([5, 3]); // More visible dashed line

      const dimensionOffset = 35; // Larger offset for dimensions
      let dimX1 = startX;
      let dimY1 = startY;
      let dimX2 = endX;
      let dimY2 = endY;

      switch (direction) {
        case 0: // right
          dimY1 += dimensionOffset;
          dimY2 += dimensionOffset;
          break;
        case 1: // down
          dimX1 -= dimensionOffset;
          dimX2 -= dimensionOffset;
          break;
        case 2: // left
          dimY1 -= dimensionOffset;
          dimY2 -= dimensionOffset;
          break;
        case 3: // up
          dimX1 += dimensionOffset;
          dimX2 += dimensionOffset;
          break;
      }

      // Draw dimension line
      ctx.beginPath();
      ctx.moveTo(dimX1, dimY1);
      ctx.lineTo(dimX2, dimY2);
      ctx.stroke();

      // Draw small perpendicular lines at ends
      const perpSize = 7; // Larger perpendicular lines

      ctx.beginPath();
      ctx.setLineDash([]); // Solid lines for endpoints
      if (direction === 0 || direction === 2) {
        // Horizontal wall
        ctx.moveTo(dimX1, dimY1 - perpSize);
        ctx.lineTo(dimX1, dimY1 + perpSize);
        ctx.moveTo(dimX2, dimY2 - perpSize);
        ctx.lineTo(dimX2, dimY2 + perpSize);

        // Add dimension text centered on dimension line with counter-rotation
        ctx.save();
        const dimTextX = (dimX1 + dimX2) / 2;
        const dimTextY = dimY1 + 15;

        ctx.translate(dimTextX, dimTextY);
        ctx.rotate(-(rotation * Math.PI) / 180);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${wall.length}`, 0, 0);
        ctx.restore();
      } else {
        // Vertical wall
        ctx.moveTo(dimX1 - perpSize, dimY1);
        ctx.lineTo(dimX1 + perpSize, dimY1);
        ctx.moveTo(dimX2 - perpSize, dimY2);
        ctx.lineTo(dimX2 + perpSize, dimY2);

        // Add dimension text for vertical walls with counter-rotation
        ctx.save();
        const dimTextX = dimX1 - 15;
        const dimTextY = (dimY1 + dimY2) / 2;

        ctx.translate(dimTextX, dimTextY);
        ctx.rotate(-(rotation * Math.PI) / 180);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`${wall.length}`, 0, 0);
        ctx.restore();
      }
      ctx.stroke();

      ctx.restore();

      // Update direction for next wall
      if (index < walls.length - 1) {
        switch (wall.joinType) {
          case '90-outward':
            direction = (direction + 1) % 4;
            break;
          case '90-inward':
            direction = (direction + 3) % 4;
            break;
          case '270-outward':
            direction = (direction + 3) % 4;
            break;
          case '270-inward':
            direction = (direction + 1) % 4;
            break;
          case 'straight':
            // Direction remains the same
            break;
        }
      }
    });

    // Draw corner points with different styles
    for (let i = 0; i < points.length; i++) {
      const [cornerX, cornerY] = points[i];

      // Draw a more visible corner point
      ctx.beginPath();
      ctx.arc(cornerX, cornerY, 6, 0, Math.PI * 2); // Larger radius
      ctx.fillStyle = '#333';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Add corner number with counter-rotation
      ctx.save();
      ctx.translate(cornerX, cornerY);
      ctx.rotate(-(rotation * Math.PI) / 180);

      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '10px Arial'; // Larger font for corner numbers
      ctx.fillText(String(i + 1), 0, 0);
      ctx.restore();
    }

    // Draw recesses if any
    if (recesses.length > 0) {
      // Skip drawing recesses on the canvas
      // Recess information is still available in the table below
    }

    // Add a scale indicator
    ctx.save();
    const scaleBarLength = 1000; // 1000mm = 1m
    const scaleBarWidth = scaleBarLength * scale;
    const scaleBarX = width - margin - scaleBarWidth;
    const scaleBarY = height - margin / 2;

    // Draw scale bar
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY);
    ctx.lineTo(scaleBarX + scaleBarWidth, scaleBarY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();

    // Add perpendicular ends
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY - 5);
    ctx.lineTo(scaleBarX, scaleBarY + 5);
    ctx.moveTo(scaleBarX + scaleBarWidth, scaleBarY - 5);
    ctx.lineTo(scaleBarX + scaleBarWidth, scaleBarY + 5);
    ctx.stroke();

    // Add scale text with counter-rotation
    ctx.save();
    const scaleTextX = scaleBarX + scaleBarWidth / 2;
    const scaleTextY = scaleBarY - 10;

    ctx.translate(scaleTextX, scaleTextY);
    ctx.rotate(-(rotation * Math.PI) / 180);

    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText('1m', 0, 0);
    ctx.restore();

    ctx.restore();

    // Restore the context to remove transformations
    ctx.restore();

    // Add zoom controls overlay (not affected by transformations, always at top left)
    // This is AFTER ctx.restore() to ensure it stays fixed at the top left
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(10, 10, 160, 40);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText(`Zoom: ${Math.round(zoom * 100)}% Rot: ${rotation}°`, 20, 30);
  }, [walls, recesses, zoom, panPosition, rotation, shutterWidth]);

  // Update summary whenever walls change
  useEffect(() => {
    const shSummary: Record<number, number> = {};
    const rbSummary: Record<number, number> = {};

    // Count all shutters
    walls.forEach((wall) => {
      wall.shutters.forEach((size) => {
        shSummary[size] = (shSummary[size] || 0) + 1;
      });
    });

    // Count all rebates
    walls.forEach((wall) => {
      wall.rebates.forEach((size) => {
        rbSummary[size] = (rbSummary[size] || 0) + 1;
      });
    });

    setShutterSummary(shSummary);
    setRebateSummary(rbSummary);

    // Redraw floor plan when walls change
    drawFloorPlan();
  }, [walls, recesses, drawFloorPlan]);

  // Set up canvas on first render
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set the canvas to be the same size as its CSS display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Initial draw
      drawFloorPlan();
    };

    setupCanvas();

    // Redraw on window resize
    window.addEventListener('resize', setupCanvas);
    return () => {
      window.removeEventListener('resize', setupCanvas);
    };
  }, [drawFloorPlan]);

  // Format size display (without units)
  const formatSize = (size: number) => `${size}`;

  // Get the right label for join types
  const getJoinTypeLabel = (joinType: JoinType) => {
    switch (joinType) {
      case '90-outward':
        return 'Turn right (90°)';
      case '90-inward':
        return 'Turn left (90°)';
      case '270-outward':
        return 'Turn left (270°)';
      case '270-inward':
        return 'Turn right (270°)';
      case 'straight':
        return 'Straight';
      default:
        return joinType;
    }
  };

  // Generate the table layout similar to the provided image
  const generateTableRows = () =>
    walls.map((wall, index) => (
      <TableRow key={wall.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <TextField
            type="number"
            value={wall.length || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateWallLength(wall.id, Number(e.target.value))
            }
            size="small"
            fullWidth
          />
        </TableCell>
        <TableCell className="shutter-column">
          {wall.shutters.map((size, i) => (
            <Box key={i} sx={{ p: 0.5 }}>
              {String(size) !== 'BLK' ? formatSize(size) : 'BLK'}
            </Box>
          ))}
        </TableCell>
        <TableCell className="rebate-column">
          {wall.rebates.map((size, i) => (
            <Box key={i} sx={{ p: 0.5 }}>
              {formatSize(size)}
            </Box>
          ))}
        </TableCell>
        <TableCell>
          <FormControl fullWidth size="small">
            <InputLabel id={`join-type-label-${wall.id}`}>Join</InputLabel>
            <Select
              labelId={`join-type-label-${wall.id}`}
              value={wall.joinType}
              label="Join"
              onChange={(e) => updateWallJoinType(wall.id, e.target.value as JoinType)}
            >
              <MenuItem value="90-outward">{getJoinTypeLabel('90-outward')}</MenuItem>
              <MenuItem value="90-inward">{getJoinTypeLabel('90-inward')}</MenuItem>
              <MenuItem value="270-outward">{getJoinTypeLabel('270-outward')}</MenuItem>
              <MenuItem value="270-inward">{getJoinTypeLabel('270-inward')}</MenuItem>
              <MenuItem value="straight">{getJoinTypeLabel('straight')}</MenuItem>
            </Select>
          </FormControl>
        </TableCell>
        <TableCell>
          <FormControlLabel
            control={
              <Switch
                checked={wall.isInset}
                onChange={() => toggleInsetWall(wall.id)}
                size="small"
              />
            }
            label={wall.isInset ? 'P' : ''}
          />
        </TableCell>
        <TableCell>
          <IconButton
            size="small"
            color="error"
            onClick={() => removeWall(wall.id)}
            disabled={walls.length <= 1}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));

  return (
    <CalculatorContainer>
      <Typography variant="h4" gutterBottom>
        Foundation Perimeter Calculator
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Floor Plan Preview
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <FloorPlanCanvas
                  ref={canvasRef}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
                  >
                    -
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setZoom((prev) => Math.min(10, prev + 0.1))}
                  >
                    +
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => rotateCanvas('counterclockwise')}
                  >
                    ↺
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => rotateCanvas('clockwise')}
                  >
                    ↻
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setZoom(1);
                      setPanPosition({ x: 0, y: 0 });
                      setRotation(0);
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">
                  The floor plan shows wall lengths, joins, and shutters. Use mouse wheel
                  to zoom, drag to pan, and rotation buttons to rotate 90°.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Shutter Width:
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={shutterWidth}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0) {
                        setShutterWidth(value);
                      }
                    }}
                    InputProps={{
                      endAdornment: <Box component="span">mm</Box>,
                      inputProps: {
                        min: 50,
                        max: 500,
                        style: { width: '60px' }
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wall Measurements
          </Typography>

          <ShutterRebateTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="60">Wall #</TableCell>
                  <TableCell width="120">Length</TableCell>
                  <TableCell>Shutters</TableCell>
                  <TableCell>Brick Rebates</TableCell>
                  <TableCell width="150">Join Type</TableCell>
                  <TableCell width="100">Precise (P)</TableCell>
                  <TableCell width="60">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{generateTableRows()}</TableBody>
            </Table>
          </ShutterRebateTable>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addWall}>
              Add Wall
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <SummaryContainer>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shutters Summary
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="shutter-column">Size</TableCell>
                        <TableCell align="right" className="shutter-column">
                          Quantity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(shutterSummary)
                        .sort(([sizeA], [sizeB]) => Number(sizeB) - Number(sizeA))
                        .map(([size, count]) => (
                          <TableRow key={`shutter-${size}`}>
                            <TableCell className="shutter-column">
                              {formatSize(Number(size))}
                            </TableCell>
                            <TableCell align="right" className="shutter-column">
                              {count}
                            </TableCell>
                          </TableRow>
                        ))}
                      {Object.keys(shutterSummary).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="center"
                            className="shutter-column"
                          >
                            No data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </SummaryContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <SummaryContainer>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Brick Rebates Summary
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className="rebate-column">Size</TableCell>
                        <TableCell align="right" className="rebate-column">
                          Quantity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(rebateSummary)
                        .sort(([sizeA], [sizeB]) => Number(sizeB) - Number(sizeA))
                        .map(([size, count]) => (
                          <TableRow key={`rebate-${size}`}>
                            <TableCell className="rebate-column">
                              {formatSize(Number(size))}
                            </TableCell>
                            <TableCell align="right" className="rebate-column">
                              {count}
                            </TableCell>
                          </TableRow>
                        ))}
                      {Object.keys(rebateSummary).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} align="center" className="rebate-column">
                            No data
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </SummaryContainer>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recessed Areas
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Width</TableCell>
                  <TableCell>Height</TableCell>
                  <TableCell>Depth</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell width="80">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recesses.map((recess) => (
                  <TableRow key={recess.id}>
                    <TableCell>{recess.type}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={recess.width || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRecess(recess.id, 'width', Number(e.target.value))
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={recess.height || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRecess(recess.id, 'height', Number(e.target.value))
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={recess.depth || ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRecess(recess.id, 'depth', Number(e.target.value))
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={recess.location}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRecess(recess.id, 'location', e.target.value)
                        }
                        size="small"
                        fullWidth
                        helperText="Specify wall number or position"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={recess.notes}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateRecess(recess.id, 'notes', e.target.value)
                        }
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRecess(recess.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {recesses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No recessed areas added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addRecess('shower')}
            >
              Add Shower
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addRecess('garage')}
            >
              Add Garage
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addRecess('joinery')}
            >
              Add Joinery
            </Button>
          </Box>
        </CardContent>
      </Card>
    </CalculatorContainer>
  );
};
