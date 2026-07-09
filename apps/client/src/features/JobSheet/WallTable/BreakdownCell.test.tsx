import { type PackedRun } from '@dreams-built/shared/src/jobsheet/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BreakdownCell } from './BreakdownCell';

const run = (cuts: PackedRun['cuts'], overhangMm = 0): PackedRun => ({
  effectiveLengthMm: cuts.reduce((acc, cut) => acc + cut.lengthMm, 0),
  cuts,
  overhangMm
});

describe('BreakdownCell', () => {
  it('renders standard cuts, polystyrene shorts, BLK and the overhang caption', () => {
    render(
      <BreakdownCell
        section="shutters"
        shutters={run(
          [
            { kind: 'standard', lengthMm: 4800, polystyrene: false },
            { kind: 'short', lengthMm: 355, polystyrene: true },
            { kind: 'blk', lengthMm: 120, polystyrene: false }
          ],
          420
        )}
      />
    );
    expect(screen.getByText('4800')).toBeInTheDocument();
    expect(screen.getByText('355p')).toBeInTheDocument();
    expect(screen.getByText('BLK')).toBeInTheDocument();
    expect(screen.getByText('+420')).toBeInTheDocument();
  });

  it('renders an angled short with its angle annotation', () => {
    render(
      <BreakdownCell
        section="shutters"
        shutters={run([
          { kind: 'short', lengthMm: 420, polystyrene: false, angleDeg: 45 }
        ])}
      />
    );
    expect(screen.getByText('420 @45°')).toBeInTheDocument();
  });

  it('renders "-" for a wall with no rebate', () => {
    render(<BreakdownCell section="rebate" rebateRuns={[]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('separates rebate segments and shows the override badge when overridden', () => {
    render(
      <BreakdownCell
        section="rebate"
        isOverridden
        rebateRuns={[
          run([{ kind: 'standard', lengthMm: 600, polystyrene: false }]),
          run([{ kind: 'short', lengthMm: 185, polystyrene: false }])
        ]}
      />
    );
    expect(screen.getByTestId('override-badge')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
    expect(screen.getByText('185')).toBeInTheDocument();
    expect(screen.getByText('|')).toBeInTheDocument();
  });
});
