import { DEFAULT_JOBSHEET_RULES } from '@dreams-built/shared/src/jobsheet/defaults';
import { computeJobSheet } from '@dreams-built/shared/src/jobsheet/engine/computeSheet';
import { computeFloorOutline } from '@dreams-built/shared/src/jobsheet/engine/geometry';
import {
  jobSheetDataSchema,
  type JobSheetData,
  type Wall
} from '@dreams-built/shared/src/jobsheet/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FloorPlanPanel } from '.';

const rules = DEFAULT_JOBSHEET_RULES;

const wall = (id: string, lengthMm: number, patch: Partial<Wall> = {}): Wall => ({
  ...jobSheetDataSchema.parse({ walls: [{ id, lengthMm }] }).walls[0],
  ...patch
});

const outlineOf = (walls: Wall[]) => {
  const data: JobSheetData = { ...jobSheetDataSchema.parse({}), walls };
  return computeFloorOutline(data, computeJobSheet(data, rules), rules);
};

const noop = vi.fn();

describe('FloorPlanPanel', () => {
  it('renders the slab polygon with cut labels and no warning when closed', () => {
    const outline = outlineOf([
      wall('w1', 6000, { isGarageDoorWall: true }),
      wall('w2', 4000),
      wall('w3', 6000),
      wall('w4', 4000)
    ]);
    render(
      <FloorPlanPanel outline={outline} includeInPrint={false} onIncludeInPrintChange={noop} />
    );

    expect(screen.getByTestId('floor-plan-svg')).toBeInTheDocument();
    expect(screen.queryByTestId('misclosure-chip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('misclosure-line')).not.toBeInTheDocument();
    // 6000 packs as 4800 + 1200 on both long walls.
    expect(screen.getAllByText('4800').length).toBeGreaterThanOrEqual(2);
    // Garage-door wall is marked on the wall number.
    expect(screen.getByText('1 ⌂')).toBeInTheDocument();
  });

  it('shows the misclosure warning and dashed gap when the walls do not close', () => {
    const outline = outlineOf([
      wall('w1', 6000),
      wall('w2', 4000),
      wall('w3', 5400),
      wall('w4', 4000)
    ]);
    render(
      <FloorPlanPanel outline={outline} includeInPrint={false} onIncludeInPrintChange={noop} />
    );

    expect(screen.getByTestId('misclosure-chip')).toHaveTextContent(
      "Doesn't close by 600mm"
    );
    expect(screen.getByTestId('misclosure-line')).toBeInTheDocument();
  });

  it('renders the empty state without walls', () => {
    render(
      <FloorPlanPanel
        outline={outlineOf([])}
        includeInPrint={false}
        onIncludeInPrintChange={noop}
      />
    );
    expect(screen.getByText('Add walls to see the floor outline.')).toBeInTheDocument();
  });
});
