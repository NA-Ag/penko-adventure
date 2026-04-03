/**
 * Custom Penko Icons - Full Body Character Variants (Pixel Matrix)
 * Replaces standard emojis with thematic Penko character art based on the 16x16 animation frames.
 */

import React from 'react';
import { PENKO_IDLE } from '../penko_anim/idle';

export type PenkoIconType = 
  | 'adventure' | 'educational' 
  | 'beginner' | 'advanced'
  | 'romance' | 'germanic' | 'slavic' | 'indo_aryan' 
  | 'east_asian' | 'austronesian' | 'dravidian' | 'semitic' 
  | 'turkic' | 'niger_congo' | 'uralic' | 'afro_asiatic' 
  | 'celtic' | 'ie_other' | 'other';

interface PenkoIconProps {
  type: PenkoIconType;
  size?: number;
  className?: string;
}

// Color palette: 0=transparent, 1=black, 2=white, 3=blue-gray, 4=orange, 
// 5=custom (genre specific), 6=custom2, 7=custom3
const COLORS = {
  0: 'transparent',
  1: '#111',    // Outline
  2: '#fff',    // Belly/Eyes
  3: '#64748b', // Slate-500 (Body)
  4: '#f97316', // Orange-500 (Beak/Feet)
  5: '#ef4444', // Red
  6: '#fbbf24', // Amber/Yellow
  7: '#3b82f6', // Blue
  8: '#22c55e', // Green
  9: '#a855f7', // Purple
  10: '#ec4899', // Pink
};

export const PenkoIcon: React.FC<PenkoIconProps> = ({ type, size = 64, className = '' }) => {
  const pixelSize = size / 16;
  
  // Start with base idle frame
  let matrix = JSON.parse(JSON.stringify(PENKO_IDLE[0]));

  // Apply "costume" modifications to the matrix
  switch (type) {
    case 'adventure':
      // Knight Armor (Full silver helmet + Red Plume)
      for(let x=4; x<=11; x++) matrix[2][x] = 1; // Helmet outline
      for(let x=5; x<=10; x++) matrix[3][x] = 3; // Visor
      matrix[4][7] = 1; matrix[4][8] = 1; // Breathing slits
      for(let y=0; y<=1; y++) matrix[y][8] = 5; // RED PLUME
      matrix[1][7] = 5; matrix[1][9] = 5;
      // Shield (Held on left)
      for(let y=8; y<=11; y++) {
        for(let x=1; x<=3; x++) matrix[y][x] = 3;
      }
      matrix[9][2] = 6; // Golden emblem on shield
      break;

    case 'educational':
      // LARGE Graduation Cap
      for(let x=2; x<=13; x++) matrix[1][x] = 1; // Diamond top
      matrix[0][7] = 1; matrix[0][8] = 1;
      for(let y=2; y<=4; y++) matrix[y][13] = 6; // Long golden tassel
      // Scroll (Held in wing)
      for(let y=9; y<=12; y++) matrix[y][3] = 2;
      matrix[9][2] = 6; matrix[12][2] = 6; // Ribbon on scroll
      break;

    case 'beginner':
      // Large Sprout
      matrix[0][8] = 8; matrix[0][7] = 8;
      matrix[1][8] = 8;
      // Explorer Backpack (Detailed)
      for(let y=7; y<=11; y++) {
        matrix[y][3] = 7; matrix[y][4] = 7;
      }
      matrix[8][3] = 6; // Buckle
      break;

    case 'advanced':
      // Ornate Royal Crown
      for(let x=4; x<=11; x++) matrix[2][x] = 6;
      matrix[1][4] = 6; matrix[1][6] = 6; matrix[1][9] = 6; matrix[1][11] = 6;
      matrix[1][5] = 5; matrix[1][10] = 7; // Jewels (Red/Blue)
      // Royal Cape (Purple sides)
      for(let y=7; y<=13; y++) {
        matrix[y][3] = 9; matrix[y][12] = 9;
      }
      break;

    case 'romance':
      // LARGE Mexican Sombrero (Extra wide brim + tall peak)
      for(let x=1; x<=14; x++) matrix[3][x] = 6; // Extra Wide Brim
      for(let x=5; x<=10; x++) matrix[2][x] = 6; // Peak base
      for(let x=6; x<=9; x++) matrix[1][x] = 6;  // Peak middle
      for(let x=7; x<=8; x++) matrix[0][x] = 6;  // Peak top
      matrix[2][6] = 5; matrix[2][9] = 5; // Decorative red spots
      // Heart blush
      matrix[5][5] = 10; matrix[5][10] = 10;
      break;

    case 'germanic':
      // Tyrolean Mountain Hat (Alpine style)
      for(let x=4; x<=11; x++) matrix[2][x] = 8; // Green Brim
      for(let x=5; x<=10; x++) matrix[1][x] = 8; // Tapered top
      matrix[1][5] = 5; // Red hat band detail
      matrix[0][5] = 2; // White feather!
      // Visible Lederhosen (Thicker green straps)
      for(let y=8; y<=11; y++) {
        matrix[y][5] = 8; matrix[y][6] = 8; // Left thick strap
        matrix[y][9] = 8; matrix[y][10] = 8; // Right thick strap
      }
      matrix[10][7] = 8; matrix[10][8] = 8; // Horizontal chest bar
      break;

    case 'slavic':
      // OVERSIZED Ushanka (Extends beyond head)
      for(let x=3; x<=12; x++) matrix[1][x] = 1; // Top part
      for(let y=2; y<=5; y++) {
        matrix[y][3] = 1; matrix[y][4] = 1;   // Big left flap
        matrix[y][11] = 1; matrix[y][12] = 1; // Big right flap
      }
      // Red Star
      matrix[2][7] = 5; matrix[2][8] = 5;
      // Heavy Winter Coat (Charcoal body)
      for(let y=7; y<=12; y++) {
        for(let x=0; x<=15; x++) {
          if(matrix[y][x] === 3) matrix[y][x] = 1; 
        }
      }
      matrix[8][7] = 6; matrix[10][7] = 6; // Golden buttons
      break;

    case 'east_asian':
      // GRAND Conical Hat
      for(let x=2; x<=13; x++) matrix[4][x] = 4; // Extra wide base
      for(let x=5; x<=10; x++) matrix[3][x] = 4;
      for(let x=7; x<=8; x++) matrix[2][x] = 4;
      // Silk Sash (Red)
      for(let x=6; x<=9; x++) matrix[10][x] = 5;
      break;

    case 'austronesian':
      // Big Hibiscus
      matrix[1][11] = 10; matrix[1][12] = 10;
      matrix[2][10] = 10; matrix[2][11] = 6; matrix[2][12] = 10;
      matrix[3][11] = 10; matrix[3][12] = 10;
      // Grass Skirt (Yellow fringe)
      for(let x=5; x<=10; x++) matrix[12][x] = 6;
      for(let x=5; x<=10; x++) {
        if(x % 2 === 0) matrix[13][x] = 6;
      }
      break;

    case 'semitic':
      // Flowing Keffiyeh (Headcloth)
      for(let x=3; x<=12; x++) matrix[2][x] = 2;
      for(let y=3; y<=7; y++) {
        matrix[y][3] = 2; matrix[y][12] = 2; // Sides hanging down
      }
      for(let x=4; x<=11; x++) matrix[3][x] = 1; // Black headband (Agal)
      break;

    case 'turkic':
      // Large Fez
      for(let y=0; y<=2; y++) {
        for(let x=6; x<=10; x++) matrix[y][x] = 5;
      }
      for(let y=1; y<=4; y++) matrix[y][11] = 1; // Black tassel
      break;

    case 'indo_aryan':
      // Multi-layered Turban
      for(let x=4; x<=11; x++) matrix[2][x] = 6;
      for(let x=5; x<=10; x++) matrix[1][x] = 4; // Layer 2
      matrix[1][7] = 5; matrix[1][8] = 5; // Center Jewel
      break;

    case 'dravidian':
      // Golden Temple Crown
      for(let x=5; x<=10; x++) matrix[2][x] = 6;
      for(let x=6; x<=9; x++) matrix[1][x] = 6;
      matrix[0][7] = 6; matrix[0][8] = 6;
      matrix[5][7] = 5; matrix[5][8] = 5; // Bindi detail
      break;

    case 'niger_congo':
      // Ceremonial Mask (Side view)
      for(let y=4; y<=9; y++) {
        matrix[y][11] = 4; matrix[y][12] = 4;
      }
      matrix[5][12] = 6; matrix[8][12] = 6; // Mask details
      // Vibrant Beads
      matrix[7][6] = 5; matrix[7][7] = 7; matrix[7][8] = 8; matrix[7][9] = 10;
      break;

    case 'uralic':
      // Large Nordic Beanie
      for(let x=4; x<=11; x++) matrix[2][x] = 7; // Blue base
      for(let x=5; x<=10; x++) matrix[1][x] = 2; // White pattern
      matrix[0][7] = 2; matrix[0][8] = 2; // Pom-pom
      // Striped Scarf
      for(let x=5; x<=10; x++) {
        matrix[6][x] = (x % 2 === 0) ? 7 : 2;
      }
      break;

    case 'afro_asiatic':
      // Pharaonic Nemes (Striped)
      for(let x=3; x<=12; x++) matrix[2][x] = 6; // Gold top
      for(let y=3; y<=8; y++) {
        matrix[y][3] = (y % 2 === 0) ? 6 : 7; // Left stripes
        matrix[y][4] = (y % 2 === 0) ? 6 : 7;
        matrix[y][11] = (y % 2 === 0) ? 6 : 7; // Right stripes
        matrix[y][12] = (y % 2 === 0) ? 6 : 7;
      }
      break;

    case 'celtic':
      // Plaid Tam-O-Shanter
      for(let x=4; x<=11; x++) matrix[1][x] = 8;
      for(let x=5; x<=10; x++) matrix[0][x] = 8;
      matrix[0][7] = 5; // Red pom-pom
      // Tartan Sash
      for(let y=7; y<=12; y++) matrix[y][y-2] = 5; // Diagonal red strap
      break;

    case 'ie_other':
      // Large Laurel Wreath
      for(let x=4; x<=11; x++) {
        if(x < 7 || x > 8) {
          matrix[2][x] = 8; matrix[1][x] = 8;
        }
      }
      // White Toga (Shoulder wrap)
      for(let x=4; x<=7; x++) matrix[7][x] = 2;
      matrix[8][4] = 2; matrix[9][4] = 2;
      break;
  }

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
      {matrix.map((row: number[], y: number) =>
        row.map((cell: number, x: number) => (
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
