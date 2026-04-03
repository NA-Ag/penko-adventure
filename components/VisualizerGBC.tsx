/**
 * GBC-Style Visualizer - Top-Down Pokemon Style
 *
 * Procedurally generates a tilemap based on biome and populates it with features/entities
 * using a seeded RNG so the scene remains stable until it changes.
 */

import React, { useEffect, useRef, useState } from 'react';
import { SceneData } from '../types';
import { PENKO_ANIMATIONS, PENKO_PALETTE, AnimationName } from './penko_anim';
import { parseScene, ParsedScene } from '../services/SceneParser';

interface VisualizerGBCProps {
  sceneData: SceneData | undefined;
  narrativeText?: string;
}

// Simple seeded RNG
function createSeededRandom(seed: string) {
  let h = 0xdeadbeef;
  for(let i=0; i<seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  }
}

const EMOJI_MAP: Record<string, string> = {
  tree: '🌲', woods: '🌲', forest: '🌲',
  rock: '🪨', stone: '🪨', boulder: '🪨',
  house: '🏠', building: '🏢', shop: '🏪', cafe: '☕',
  merchant: '🧔', shopkeeper: '🧔', person: '🧍', villager: '🧍',
  sign: '🪧', board: '🪧',
  water: '💧', river: '🌊', lake: '🌊', pool: '💧',
  chest: '📦', box: '📦', treasure: '💎',
  door: '🚪', gate: '🚪', entrance: '🚪',
  cave: '🕳️', hole: '🕳️',
  sword: '🗡️', weapon: '🗡️', shield: '🛡️',
  enemy: '👾', monster: '👹', goblin: '👺', dragon: '🐉',
  animal: '🐺', cat: '🐈', dog: '🐕', bird: '🐦',
  car: '🚗', vehicle: '🚗', bike: '🚲',
  neon: '🪩', light: '💡', lamp: '🏮',
  robot: '🤖', computer: '💻', machine: '⚙️',
  grave: '🪦', tomb: '🪦', skeleton: '💀', bone: '🦴',
  fire: '🔥', flame: '🔥', campfire: '🔥',
  flower: '🌸', plant: '🌿', bush: '🌿', grass: '🌱',
  mountain: '⛰️', hill: '⛰️',
  bridge: '🌉',
  road: '🛣️', path: '🛣️', street: '🛣️',
  wall: '🧱', fence: '🧱',
  window: '🪟',
  bed: '🛏️', chair: '🪑', table: '🪑',
  food: '🍎', cake: '🍰', fruit: '🍎',
  drink: '🥤', coffee: '☕', tea: '🍵',
  potion: '🧪', bottle: '🍾'
};

function getEmojiForWord(word: string) {
   const w = word.toLowerCase();
   for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
      if (w.includes(key)) return emoji;
   }
   return '❓'; // Generic unknown
}

const BIOME_COLORS: Record<string, { bg: string; dot: string; path: string }> = {
  forest: { bg: '#4a9a4a', dot: '#2d6b2d', path: '#c09070' },
  town: { bg: '#a0a0a0', dot: '#808080', path: '#c0c0c0' },
  desert: { bg: '#f0c060', dot: '#d08030', path: '#ffd080' },
  cave: { bg: '#403030', dot: '#201515', path: '#504040' },
  dungeon: { bg: '#403050', dot: '#201020', path: '#504060' },
  graveyard: { bg: '#405060', dot: '#202838', path: '#506070' },
  cyber_city: { bg: '#1a3050', dot: '#00ffff', path: '#2a4060' },
  canyon: { bg: '#d07040', dot: '#a04020', path: '#e08050' },
  interior: { bg: '#c0a080', dot: '#9a7050', path: '#d0b090' },
};

export const VisualizerGBC: React.FC<VisualizerGBCProps> = ({ sceneData, narrativeText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [parsedScene, setParsedScene] = useState<ParsedScene | null>(null);
  const previousSceneRef = useRef<ParsedScene | null>(null);
  
  const [facing, setFacing] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);

  // Parse narrative text and update direction
  useEffect(() => {
    if (narrativeText) {
      const scene = parseScene(narrativeText, previousSceneRef.current || undefined);
      setParsedScene(scene);
      previousSceneRef.current = scene;

      // Determine facing direction from text
      const lower = narrativeText.toLowerCase();
      let newFacing = facing;
      if (lower.match(/\b(north|up|forward|ahead)\b/)) newFacing = 'up';
      else if (lower.match(/\b(south|down|back|backward)\b/)) newFacing = 'down';
      else if (lower.match(/\b(west|left)\b/)) newFacing = 'left';
      else if (lower.match(/\b(east|right)\b/)) newFacing = 'right';
      
      if (newFacing !== facing || scene.penkoAction === 'walk') {
         setFacing(newFacing);
         setIsMoving(true);
         // Stop moving after 1.5 seconds
         const t = setTimeout(() => setIsMoving(false), 1500);
         return () => clearTimeout(t);
      }

    } else if (sceneData) {
      const scene: ParsedScene = {
        biome: sceneData.biome,
        features: sceneData.features,
        entities: sceneData.entities,
        timeOfDay: sceneData.timeOfDay,
        penkoAction: 'idle',
      };
      setParsedScene(scene);
      previousSceneRef.current = scene;
    }
  }, [narrativeText, sceneData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !parsedScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed GBC resolution
    canvas.width = 320;
    canvas.height = 240;

    const tileSize = 32; // 10x7.5 tiles on screen
    const cols = Math.ceil(320 / tileSize);
    const rows = Math.ceil(240 / tileSize);

    const biome = parsedScene.biome;
    const colors = BIOME_COLORS[biome] || BIOME_COLORS.forest;

    // Seed RNG based on scene contents so it stays stable
    const seed = biome + parsedScene.features.join('') + parsedScene.entities.join('');
    const rng = createSeededRandom(seed);

    // Draw Map
    const drawMap = () => {
      // Base background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 320, 240);

      // Draw textured tiles
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const isPath = rng() > 0.7; // 30% chance for a path/variation tile
          if (isPath) {
             ctx.fillStyle = colors.path;
             ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          }
          
          // Draw a little dot/texture marker
          if (rng() > 0.5) {
             ctx.fillStyle = colors.dot;
             const dotX = x * tileSize + rng() * (tileSize - 4);
             const dotY = y * tileSize + rng() * (tileSize - 4);
             ctx.fillRect(dotX, dotY, 4, 4);
          }
        }
      }

      // Draw objects (Features & Entities)
      const allObjects = [...parsedScene.features, ...parsedScene.entities];
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      allObjects.forEach((obj, idx) => {
        // Find a random spot that isn't exactly the center (where Penko is)
        let tx = Math.floor(rng() * cols);
        let ty = Math.floor(rng() * rows);
        
        // Push away from center (4, 3)
        if (tx === 4 || tx === 5) tx = rng() > 0.5 ? tx + 2 : tx - 2;
        if (ty === 3 || ty === 4) ty = rng() > 0.5 ? ty + 2 : ty - 2;

        // Keep bounds
        tx = Math.max(0, Math.min(cols - 1, tx));
        ty = Math.max(0, Math.min(rows - 1, ty));

        const emoji = getEmojiForWord(obj);
        
        // Add a small shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(tx * tileSize + 16, ty * tileSize + 26, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillText(emoji, tx * tileSize + 16, ty * tileSize + 16);
      });

      // Time of Day Overlays
      if (parsedScene.timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(0, 0, 50, 0.4)';
        ctx.fillRect(0, 0, 320, 240);
      } else if (parsedScene.timeOfDay === 'sunset') {
        ctx.fillStyle = 'rgba(255, 140, 80, 0.2)';
        ctx.fillRect(0, 0, 320, 240);
      } else if (parsedScene.timeOfDay === 'foggy') {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.fillRect(0, 0, 320, 240);
      }
    };

    // Draw Penko
    const drawPenko = (frame: number) => {
      // Determine animation key from state
      let animKey = `${isMoving ? 'walk' : 'idle'}_${facing}` as AnimationName;
      
      // Fallback if animation doesn't exist
      if (!PENKO_ANIMATIONS[animKey]) {
          animKey = 'idle_down' as any;
      }

      const animation = PENKO_ANIMATIONS[animKey];
      const sprite = animation[frame % animation.length];
      if (!sprite || !Array.isArray(sprite)) return;

      const scale = 2;
      const px = 160 - (16 * scale) / 2; // Center horizontally
      const py = 120 - (16 * scale) / 2; // Center vertically

      // Draw shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(160, 120 + (8 * scale), 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw sprite
      sprite.forEach((row: number[], sy: number) => {
        if (!Array.isArray(row)) return;
        row.forEach((pixel: number, sx: number) => {
          if (pixel !== 0 && PENKO_PALETTE[pixel]) {
            ctx.fillStyle = PENKO_PALETTE[pixel];
            ctx.fillRect(px + sx * scale, py + sy * scale, scale, scale);
          }
        });
      });
    };

    const drawScene = (frame: number) => {
      ctx.clearRect(0, 0, 320, 240);
      drawMap();
      drawPenko(frame);
    };

    drawScene(currentFrame);
  }, [parsedScene, currentFrame, facing, isMoving]);

  // Animation Loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 4);
    }, 250); // 4 FPS

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full h-full relative">
      {parsedScene ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <span className="text-green-500 font-pixel tracking-widest animate-pulse">
            INITIALIZING...
          </span>
        </div>
      )}
    </div>
  );
};
