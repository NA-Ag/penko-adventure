/**
 * Penko Logo - Retro pixel-art penguin mascot with matrix-style animation
 * Uses Commodore 64 style cel-based sprite rendering
 */

import React, { useEffect, useState } from 'react';

interface PenkoLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

// Color palette: 0=transparent, 1=black, 2=white, 3=blue-gray, 4=orange
const COLORS = {
  0: 'transparent',
  1: '#111',
  2: '#fff',
  3: '#64748b', // slate-500
  4: '#f97316', // orange-500
};

// Idle animation frames (2 frames - breathing)
const IDLE_FRAMES = [
  // Frame 0: Normal stance
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,1,3,2,2,1,3,3,1,2,2,3,1,0,0],
    [0,0,1,3,2,2,1,3,3,1,2,2,3,1,0,0],
    [0,0,1,3,3,3,4,4,4,4,3,3,3,1,0,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
    [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
    [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [0,0,1,3,3,3,3,1,1,3,3,3,3,1,0,0],
    [0,0,0,1,4,4,1,0,0,1,4,4,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  // Frame 1: Slight breathing
  [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,1,3,2,2,1,3,3,1,2,2,3,1,0,0],
    [0,0,1,3,2,2,1,3,3,1,2,2,3,1,0,0],
    [0,0,1,3,3,3,4,4,4,4,3,3,3,1,0,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,3,2,2,2,2,2,2,2,2,2,2,3,1,0],
    [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [0,0,1,3,3,3,3,1,1,3,3,3,3,1,0,0],
    [0,0,0,1,4,4,1,0,0,1,4,4,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
];

export const PenkoLogo: React.FC<PenkoLogoProps> = ({
  size = 80,
  className = '',
  animated = true
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const pixelSize = size / 16; // 16x16 grid

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % IDLE_FRAMES.length);
    }, 500); // 500ms per frame (slower breathing)

    return () => clearInterval(interval);
  }, [animated]);

  const currentFrame = IDLE_FRAMES[frameIndex];

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(16, ${pixelSize}px)`,
        gridTemplateRows: `repeat(16, ${pixelSize}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {currentFrame.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              backgroundColor: COLORS[cell as keyof typeof COLORS],
              width: pixelSize,
              height: pixelSize,
            }}
          />
        ))
      )}
    </div>
  );
};
