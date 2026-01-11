/**
 * Community Mode Icon - Multiple mini Penkos using actual sprite data
 * Displays 4 small copies of the real Penko sprite
 */

import React from 'react';
import { PENKO_IDLE } from '../penko_anim/idle';

interface IconProps {
  size?: number;
}

// Color palette from penko_anim: 0=transparent, 1=black, 2=white, 3=blue-gray, 4=orange
const COLORS = {
  0: 'transparent',
  1: '#111',
  2: '#fff',
  3: '#64748b', // slate-500
  4: '#f97316', // orange-500
};

export const CommunityModeIcon: React.FC<IconProps> = ({ size = 48 }) => {
  const penkoSprite = PENKO_IDLE[0]; // Use frame 0
  const miniPenkoSize = size / 2; // Each Penko takes 1/4 of the icon (2x2 grid)
  const pixelSize = miniPenkoSize / 16;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${miniPenkoSize}px)`,
        gridTemplateRows: `repeat(2, ${miniPenkoSize}px)`,
        gap: 0,
        imageRendering: 'pixelated',
      }}
    >
      {/* Render 4 copies of Penko in a 2x2 grid */}
      {[0, 1, 2, 3].map((penkoIndex) => (
        <div
          key={penkoIndex}
          style={{
            width: miniPenkoSize,
            height: miniPenkoSize,
            display: 'grid',
            gridTemplateColumns: `repeat(16, ${pixelSize}px)`,
            gridTemplateRows: `repeat(16, ${pixelSize}px)`,
            imageRendering: 'pixelated',
          }}
        >
          {penkoSprite.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${penkoIndex}-${x}-${y}`}
                style={{
                  backgroundColor: COLORS[cell as keyof typeof COLORS],
                  width: pixelSize,
                  height: pixelSize,
                }}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
};
