/**
 * Browser AI Mode Icon - Sleepy Penko on bed (local/at home)
 * 16x16 matrix-style pixel art using actual sprite with sleepy eyes
 */

import React from 'react';

interface IconProps {
  size?: number;
}

// Color palette: 0=transparent, 1=black, 2=white, 3=blue-gray, 4=orange, 5=light blue (pillow/sheets)
const COLORS = {
  0: 'transparent',
  1: '#111',
  2: '#fff',
  3: '#64748b', // slate-500
  4: '#f97316', // orange-500
  5: '#bae6fd', // sky-200 (pillow/sheets)
};

// Penko with VR headset on bed (browser AI/local mode)
const ICON = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0], // Penko's head
  [0,0,0,1,1,3,3,3,3,3,3,1,1,0,0,0],
  [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
  [0,0,1,3,1,1,1,1,1,1,1,1,3,1,0,0], // VR headset band (black)
  [0,0,1,3,1,0,0,0,0,0,0,1,3,1,0,0], // VR headset visor (cyan/transparent)
  [0,0,1,3,3,3,4,4,4,4,3,3,3,1,0,0], // Beak
  [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
  [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0], // White belly
  [0,1,3,3,2,2,2,2,2,2,2,2,3,3,1,0],
  [1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1], // Pillow/sheets
  [1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1],
  [1,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Bed frame
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Bed legs
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

export const BrowserAIModeIcon: React.FC<IconProps> = ({ size = 48 }) => {
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
