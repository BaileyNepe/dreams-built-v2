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

/** A plain rectangle: the auto corner convention seals it with no input. */
const sealedRectangle = () => [
  wall('w1', 6000, { isGarageDoorWall: true }),
  wall('w2', 4000),
  wall('w3', 6000),
  wall('w4', 4000)
];

const outlineOf = (walls: Wall[]) => {
  const data: JobSheetData = { ...jobSheetDataSchema.parse({}), walls };
  return computeFloorOutline(data, computeJobSheet(data, rules), rules);
};

const noop = vi.fn();

const renderPanel = (outline: ReturnType<typeof outlineOf>) =>
  render(
    <FloorPlanPanel
      outline={outline}
      rules={rules}
      includeInPrint={false}
      onIncludeInPrintChange={noop}
    />
  );

describe('FloorPlanPanel', () => {
  it('renders the slab with cut labels and no warnings when sealed and closed', () => {
    renderPanel(outlineOf(sealedRectangle()));

    expect(screen.getByTestId('floor-plan-svg')).toBeInTheDocument();
    expect(screen.queryByTestId('misclosure-chip')).not.toBeInTheDocument();
    expect(screen.queryByTestId('misclosure-line')).not.toBeInTheDocument();
    expect(screen.queryByTestId('corner-issue-chip')).not.toBeInTheDocument();
    // 6000 packs as 4800 + 1200 on both long walls.
    expect(screen.getAllByText('4800').length).toBeGreaterThanOrEqual(2);
    // Garage-door wall is marked on the wall number.
    expect(screen.getByText('1 ⌂')).toBeInTheDocument();
  });

  it('shows the misclosure warning and dashed gap when the walls do not close', () => {
    renderPanel(
      outlineOf([wall('w1', 6000), wall('w2', 4000), wall('w3', 5400), wall('w4', 4000)])
    );

    expect(screen.getByTestId('misclosure-chip')).toHaveTextContent(
      "Doesn't close by 600mm"
    );
    expect(screen.getByTestId('misclosure-line')).toBeInTheDocument();
  });

  it('flags overlapping rebate strips at an unsealed corner with a chip and marker', () => {
    // Force OFF the auto offset that seals the corner between walls 4 and 1
    // (the departing wall's strip gives way at its start by convention).
    const walls = sealedRectangle().map((w) =>
      w.id === 'w1' ? { ...w, rebateOffsetAtStart: false as boolean | null } : w
    );
    renderPanel(outlineOf(walls));

    const chip = screen.getByTestId('corner-issue-chip');
    expect(chip).toHaveTextContent('Walls 4→1: rebates overlap');
    expect(screen.getByTestId('corner-issue-marker')).toBeInTheDocument();
  });

  it('flags a shutter overlap when the auto absorb is forced off at an internal corner', () => {
    renderPanel(
      outlineOf([
        wall('w1', 6000),
        wall('w2', 4000),
        wall('w3', 2000),
        wall('w4', 2000, {
          cornerEnd: 'internal',
          absorbShutterAtEnd: false as boolean | null
        }),
        wall('w5', 4000),
        wall('w6', 2000)
      ])
    );
    expect(screen.getByTestId('corner-issue-chip')).toHaveTextContent(
      'Walls 4→5: shutters overlap'
    );
  });

  it('renders the empty state without walls', () => {
    renderPanel(outlineOf([]));
    expect(screen.getByText('Add walls to see the floor outline.')).toBeInTheDocument();
  });
});
