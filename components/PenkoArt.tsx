/**
 * Penko Character Art Variants
 * Pixel-art penguin mascot dressed for each content pack genre
 */

import React from 'react';
import type { NarrativeGenre } from '../types';

interface PenkoArtProps {
  genre: NarrativeGenre;
  size?: number;
  className?: string;
}

export const PenkoArt: React.FC<PenkoArtProps> = ({ genre, size = 64, className = '' }) => {
  const penkoVariants = {
    // Base Penko body (shared across all variants)
    fantasy: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,2 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,4 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="3" width="1" height="1" fill="#fff" />
        <rect x="9" y="3" width="1" height="1" fill="#fff" />
        {/* Eyes - pupils */}
        <rect x="6" y="3" width="1" height="1" fill="#000" rx="0.2" />
        <rect x="9" y="3" width="1" height="1" fill="#000" rx="0.2" />
        {/* Beak */}
        <path d="M7,5 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,13 h3 v1 h-3 Z M11,13 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Wizard Hat - purple */}
        <path d="M5,0 h6 v1 h-1 v1 h-4 v-1 h-1 Z" fill="#9333ea" />
        <path d="M7,1 h2 v1 h-2 Z" fill="#7c3aed" />
        {/* Hat brim */}
        <rect x="4" y="2" width="8" height="1" fill="#581c87" />
        {/* Star on hat */}
        <rect x="7" y="0" width="2" height="1" fill="#fde047" />
      </svg>
    ),

    scifi: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,3 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,5 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="4" width="1" height="1" fill="#fff" />
        <rect x="9" y="4" width="1" height="1" fill="#fff" />
        {/* Eyes - pupils */}
        <rect x="6" y="4" width="1" height="1" fill="#000" rx="0.2" />
        <rect x="9" y="4" width="1" height="1" fill="#000" rx="0.2" />
        {/* Beak */}
        <path d="M7,6 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,14 h3 v1 h-3 Z M11,14 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="6" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="6" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Space Helmet - glass dome */}
        <path d="M5,0 h6 v1 h1 v2 h-8 v-2 h1 Z" fill="#38bdf8" opacity="0.4" />
        {/* Helmet frame */}
        <rect x="4" y="3" width="8" height="1" fill="#64748b" />
        <rect x="5" y="0" width="6" height="1" fill="#64748b" />
        <rect x="4" y="1" width="1" height="2" fill="#64748b" />
        <rect x="11" y="1" width="1" height="2" fill="#64748b" />
        {/* Antenna */}
        <rect x="7" y="-1" width="2" height="1" fill="#cbd5e1" />
        <rect x="8" y="-2" width="1" height="1" fill="#ef4444" />
      </svg>
    ),

    mystery: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,2 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,4 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="3" width="1" height="1" fill="#fff" />
        <rect x="9" y="3" width="1" height="1" fill="#fff" />
        {/* Eyes - pupils (looking sideways - detective investigating!) */}
        <rect x="6" y="3" width="1" height="1" fill="#000" rx="0.2" />
        <rect x="9" y="3" width="1" height="1" fill="#000" rx="0.2" />
        {/* Beak */}
        <path d="M7,5 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,13 h3 v1 h-3 Z M11,13 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Detective Hat - brown fedora */}
        <path d="M4,1 h8 v1 h-8 Z" fill="#78350f" />
        <path d="M6,0 h4 v1 h-4 Z" fill="#92400e" />
        {/* Hat band */}
        <rect x="6" y="1" width="4" height="1" fill="#451a03" />
        {/* Magnifying Glass (held in wing/flipper area) */}
        <circle cx="11.5" cy="8.5" r="1.5" fill="#38bdf8" opacity="0.3" stroke="#64748b" strokeWidth="0.3" />
        <path d="M12,9 h1 v2 h-1 Z" fill="#78350f" />
      </svg>
    ),

    horror: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,3 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,5 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="4" width="1" height="1" fill="#fff" />
        <rect x="9" y="4" width="1" height="1" fill="#fff" />
        {/* Eyes - pupils (scared!) */}
        <rect x="6" y="4" width="1" height="1" fill="#000" rx="0.2" />
        <rect x="9" y="4" width="1" height="1" fill="#000" rx="0.2" />
        {/* Beak */}
        <path d="M7,6 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,14 h3 v1 h-3 Z M11,14 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="6" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="6" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Ghost Sheet - white with wavy bottom */}
        <path d="M4,0 h8 v1 h1 v2 h-10 v-2 h1 Z" fill="#f8fafc" opacity="0.8" />
        <path d="M4,3 h1 v1 h1 v-1 h2 v1 h1 v-1 h1 v1 h1 v-1 h1 v-1 h-8 v1 Z" fill="#f8fafc" opacity="0.8" />
        {/* Eye holes in sheet */}
        <rect x="6" y="1" width="1" height="1" fill="#111" />
        <rect x="9" y="1" width="1" height="1" fill="#111" />
        {/* Spooky wisps */}
        <rect x="3" y="2" width="1" height="1" fill="#e2e8f0" opacity="0.5" />
        <rect x="12" y="2" width="1" height="1" fill="#e2e8f0" opacity="0.5" />
      </svg>
    ),

    western: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,2 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,4 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="3" width="1" height="1" fill="#fff" />
        <rect x="9" y="3" width="1" height="1" fill="#fff" />
        {/* Eyes - pupils */}
        <rect x="6" y="3" width="1" height="1" fill="#000" rx="0.2" />
        <rect x="9" y="3" width="1" height="1" fill="#000" rx="0.2" />
        {/* Beak */}
        <path d="M7,5 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,13 h3 v1 h-3 Z M11,13 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Cowboy Hat - brown */}
        <path d="M3,1 h10 v1 h-10 Z" fill="#92400e" />
        <path d="M5,0 h6 v1 h-6 Z" fill="#78350f" />
        <rect x="6" y="0" width="4" height="1" fill="#b45309" />
        {/* Hat band - decorative */}
        <rect x="6" y="1" width="4" height="1" fill="#451a03" />
        {/* Sheriff star */}
        <path d="M7,1 h1 v-1 h-1 Z M9,1 h1 v-1 h-1 Z" fill="#fbbf24" />
      </svg>
    ),

    cyberpunk: (
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" className={className} width={size} height={size}>
        {/* Body - black outline */}
        <path d="M5,2 h6 v1 h1 v1 h1 v6 h-1 v1 h-1 v-1 h-1 v2 h3 v1 h-4 v1 h-6 v-1 h-4 v-1 h3 v-2 h-1 v1 h-1 v-1 h-1 v-6 h1 v-1 h1 v-1 Z" fill="#111" />
        {/* Body - white belly */}
        <path d="M6,4 h4 v1 h1 v5 h-1 v1 h-1 v-1 h-2 v1 h-1 v-5 h1 v-1 Z" fill="#fff" />
        {/* Eyes - white */}
        <rect x="6" y="3" width="1" height="1" fill="#fff" />
        <rect x="9" y="3" width="1" height="1" fill="#fff" />
        {/* Cyber Eyes - glowing red */}
        <rect x="6" y="3" width="1" height="1" fill="#ef4444" opacity="0.8" />
        <rect x="9" y="3" width="1" height="1" fill="#ef4444" opacity="0.8" />
        {/* Beak */}
        <path d="M7,5 h2 v1 h-2 Z" fill="#f97316" />
        {/* Feet */}
        <path d="M2,13 h3 v1 h-3 Z M11,13 h3 v1 h-3 Z" fill="#f97316" />
        {/* Blush */}
        <rect x="5" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        <rect x="10" y="5" width="1" height="1" fill="#f472b6" opacity="0.6" />
        {/* Cyber Visor - neon pink/purple */}
        <path d="M5,2 h6 v1 h-6 Z" fill="#ec4899" opacity="0.6" />
        <rect x="4" y="2" width="1" height="1" fill="#a855f7" opacity="0.4" />
        <rect x="11" y="2" width="1" height="1" fill="#a855f7" opacity="0.4" />
        {/* Neon accents */}
        <rect x="5" y="1" width="1" height="1" fill="#06b6d4" opacity="0.7" />
        <rect x="10" y="1" width="1" height="1" fill="#06b6d4" opacity="0.7" />
        {/* Digital display line */}
        <rect x="6" y="2" width="4" height="1" fill="#22d3ee" opacity="0.5" />
      </svg>
    ),
  };

  return penkoVariants[genre] || penkoVariants.fantasy;
};
