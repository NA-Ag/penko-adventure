/**
 * Cloud Mode Icon - Penko shaped like a fluffy cloud (centered)
 * 16x16 matrix-style pixel art
 */

import React from 'react';

interface IconProps {
  size?: number;
}

// Color palette: 0=transparent, 1=black, 2=white, 3=light blue (cloud color), 4=orange
const COLORS = {
  0: 'transparent',
  1: '#111',
  2: '#fff',
  3: '#93c5fd', // blue-300 (cloud color)
  4: '#f97316', // orange-500
};

// Penko-shaped cloud (puffy and cute)
const ICON = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,3,3,3,3,3,1,1,0,0,0,0],
  [0,0,1,3,3,3,3,3,3,3,3,3,1,0,0,0],
  [0,1,3,3,3,1,1,3,3,1,1,3,3,1,0,0], // Eyes
  [0,1,3,3,3,1,2,3,3,1,2,3,3,1,0,0],
  [1,3,3,3,3,3,4,4,4,4,3,3,3,3,1,0], // Beak
  [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
  [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
  [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
  [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
  [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
  [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
  [0,0,0,0,0,1,1,3,3,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

export const CloudModeIcon: React.FC<IconProps> = ({ size = 48 }) => {
  const pixelSize = size / 16;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(16, ${pixelSize}px)`,
        gridTemplateRows: `repeat(16, ${pixelSize}px)`,
        imageRendering: 'pixelated',
      }}
    >
      {ICON.map((row, y) =>
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
