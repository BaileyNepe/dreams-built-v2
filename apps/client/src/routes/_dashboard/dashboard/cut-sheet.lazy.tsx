import { createLazyFileRoute } from '@tanstack/react-router';
import { WallDrawing, type WallSegment } from 'features/CutSheet/svg';
import type React from 'react';

const App: React.FC = () => {
  const sampleSegments: WallSegment[] = [
    { length: 6420, corner: 'left' },
    { length: 12700, corner: 'left' },
    { length: 11730, corner: 'left' },
    { length: 14980, corner: 'left' },
    { length: 4150, corner: 'left' },
    { length: 4110, corner: 'right' },
    { length: 1160, corner: 'right' },
    { length: 1830, corner: 'right' }
  ];

  return (
    <div>
      <h1>Wall Layout</h1>
      <WallDrawing segments={sampleSegments} strokeColor="blue" strokeWidth={3} />
    </div>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/cut-sheet')({
  component: App
});
