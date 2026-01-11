/**
 * GBC-Style Visualizer - Simple Template-Based System
 *
 * Uses pre-made backgrounds for each biome with Penko animation overlay
 * Simpler, more reliable approach with sprite-based character animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { SceneData } from '../types';
import { PENKO_ANIMATIONS, PENKO_PALETTE, AnimationName } from './penko_anim';
import { parseScene, ParsedScene } from '../services/SceneParser';

interface VisualizerGBCProps {
  sceneData: SceneData | undefined;
  narrativeText?: string; // NEW: Use narrative text for parsing
}

export const VisualizerGBC: React.FC<VisualizerGBCProps> = ({ sceneData, narrativeText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [penkoAnim, setPenkoAnim] = useState<AnimationName>('idle');
  const [parsedScene, setParsedScene] = useState<ParsedScene | null>(null);
  const previousSceneRef = useRef<ParsedScene | null>(null);

  // Parse narrative text when it changes (fallback to AI sceneData if available)
  useEffect(() => {
    if (narrativeText) {
      const scene = parseScene(narrativeText, previousSceneRef.current || undefined);
      setParsedScene(scene);
      setPenkoAnim(scene.penkoAction);
      previousSceneRef.current = scene;
    } else if (sceneData) {
      // Fallback to AI-generated sceneData if no narrative text
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

    // Canvas setup
    canvas.width = 320;
    canvas.height = 240;

    // Biome-specific background templates (simple gradients)
    const BIOME_BACKGROUNDS: Record<string, { sky: string; ground: string; accent: string }> = {
      forest: { sky: '#4a9a4a', ground: '#2d6b2d', accent: '#8bde5a' },
      town: { sky: '#c09070', ground: '#8a6040', accent: '#f0d0b0' },
      desert: { sky: '#f0c060', ground: '#d08030', accent: '#ffe890' },
      cave: { sky: '#403030', ground: '#181010', accent: '#685858' },
      dungeon: { sky: '#503050', ground: '#201020', accent: '#806080' },
      graveyard: { sky: '#405060', ground: '#202838', accent: '#607888' },
      cyber_city: { sky: '#1a3050', ground: '#000818', accent: '#00ffff' },
      canyon: { sky: '#d07040', ground: '#a04020', accent: '#ff9860' },
      interior: { sky: '#c0a080', ground: '#9a7050', accent: '#f0d0b0' },
    };

    // Get current biome from parsed scene
    const biome = parsedScene.biome;
    const bg = BIOME_BACKGROUNDS[biome] || BIOME_BACKGROUNDS.forest;

    // Draw simple background template
    const drawBackground = () => {
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 160);
      skyGrad.addColorStop(0, bg.sky);
      skyGrad.addColorStop(1, bg.ground);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 320, 160);

      // Ground
      ctx.fillStyle = bg.ground;
      ctx.fillRect(0, 160, 320, 80);

      // Ground line accent
      ctx.fillStyle = bg.accent;
      ctx.fillRect(0, 160, 320, 4);

      // Atmospheric effects
      if (parsedScene.timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(0, 0, 50, 0.4)';
        ctx.fillRect(0, 0, 320, 240);

        // Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) {
          const x = (i * 73 + 17) % 320;
          const y = (i * 41 + 23) % 120;
          ctx.fillRect(x, y, 2, 2);
        }
      } else if (parsedScene.timeOfDay === 'sunset') {
        ctx.fillStyle = 'rgba(255, 140, 80, 0.2)';
        ctx.fillRect(0, 0, 320, 240);
      }
    };

    // Draw Penko sprite using animation library
    const drawPenko = (frame: number) => {
      const animation = PENKO_ANIMATIONS[penkoAnim];
      const sprite = animation[frame % animation.length];
      if (!sprite || !Array.isArray(sprite)) return;

      // Center position
      const x = 136; // Center horizontally (320/2 - 48/2)
      const y = 120; // Center vertically

      // Draw sprite with 3x scale
      sprite.forEach((row: number[], sy: number) => {
        if (!Array.isArray(row)) return;
        row.forEach((pixel: number, sx: number) => {
          if (pixel !== 0 && PENKO_PALETTE[pixel]) {
            ctx.fillStyle = PENKO_PALETTE[pixel];
            ctx.fillRect(x + sx * 3, y + sy * 3, 3, 3);
          }
        });
      });
    };

    // Main draw function
    const drawScene = (frame: number) => {
      drawBackground();
      drawPenko(frame);
    };

    // Draw scene whenever frame or animation changes
    drawScene(currentFrame);
  }, [parsedScene, currentFrame, penkoAnim]);

  // Separate animation loop effect (no dependencies to prevent re-creation)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 4); // 4 frame loop
    }, 250); // 4 FPS

    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty deps - only run once on mount

  return (
    <div className="w-full aspect-video bg-black rounded-lg border-4 border-gray-700 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {parsedScene ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover bg-black"
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
