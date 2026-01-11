
import React, { useEffect, useRef } from 'react';
import { SceneData } from '../types';
import { VISUALS } from '../constants';

interface VisualizerProps {
  sceneData: SceneData | undefined;
}

export const Visualizer: React.FC<VisualizerProps> = ({ sceneData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sceneData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // GBA Style Settings - Internal Resolution
    const TILE_SIZE = 48; 
    const COLS = 8;       
    const ROWS = 5;       
    
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;

    const s = (val: number) => Math.floor((val / 64) * TILE_SIZE);

    // --- PALETTES ---
    const PALETTES: Record<string, any> = {
        forest: { base: '#70c048', dark: '#50a030', detail: '#387028', objDark: '#183820', objLight: '#306838' },
        town:   { base: '#a8c0b0', dark: '#88a090', detail: '#688070', objDark: '#403830', objLight: '#806050' },
        desert: { base: '#e8e0a0', dark: '#d0c880', detail: '#b0a868', objDark: '#804020', objLight: '#c08040' },
        cave:   { base: '#706860', dark: '#585048', detail: '#403830', objDark: '#282018', objLight: '#504840' },
        dungeon:{ base: '#504058', dark: '#403048', detail: '#302038', objDark: '#201028', objLight: '#605068' },
        graveyard: { base: '#283038', dark: '#202830', detail: '#182028', objDark: '#101010', objLight: '#404040' },
        cyber_city: { base: '#101020', dark: '#080810', detail: '#202040', objDark: '#000000', objLight: '#00ffcc' },
        canyon: { base: '#c07040', dark: '#a05830', detail: '#804020', objDark: '#502010', objLight: '#e09060' },
        interior: { base: '#d0b090', dark: '#b09070', detail: '#907050', objDark: '#503020', objLight: '#805040' },
    };

    const p = PALETTES[sceneData.biome] || PALETTES['forest'];

    // --- ASSET DRAWING FUNCTIONS ---
    const rect = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    };

    const circle = (x: number, y: number, r: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    };

    const drawScene = () => {
        // 1. Draw Terrain
        rect(0, 0, canvas.width, canvas.height, p.base);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;
                if ((r + c) % 2 === 0) {
                    ctx.fillStyle = p.dark;
                    ctx.globalAlpha = 0.3;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.globalAlpha = 1.0;
                }
                // Details
                const seed = (r * 11 + c * 7) % 10;
                if (sceneData.biome === 'forest' && seed > 6) {
                    ctx.fillStyle = p.detail;
                    rect(x + s(20), y + s(40), s(6), s(6), p.detail);
                }
            }
        }

        // 2. Draw Objects & Entities (Simplified for loop speed)
        const itemsToDraw: { r: number, c: number, type: string, isEntity: boolean }[] = [];
        
        // Add Features
        const seed = sceneData.features.length + sceneData.biome.length;
        if (sceneData.features.length > 0) {
            for (let i = 0; i < 8; i++) {
                const r = (i * 3 + seed) % ROWS;
                const c = (i * 2 + seed) % COLS;
                if (r === Math.floor(ROWS/2) && c === Math.floor(COLS/2)) continue; 
                itemsToDraw.push({ r, c, type: sceneData.features[i % sceneData.features.length], isEntity: false });
            }
        }
        itemsToDraw.push({ r: Math.floor(ROWS/2), c: Math.floor(COLS/2), type: 'YOU', isEntity: true });
        sceneData.entities.forEach((entity, i) => {
            const r = (Math.floor(ROWS/2) + (i % 2 === 0 ? 1 : -1));
            const c = (Math.floor(COLS/2) + (i % 2 !== 0 ? 1 : -1));
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                itemsToDraw.push({ r, c, type: entity, isEntity: true });
            }
        });
        itemsToDraw.sort((a, b) => a.r - b.r);

        // Draw items (Reuse logic from previous version roughly)
        itemsToDraw.forEach(item => {
            const x = item.c * TILE_SIZE;
            const y = item.r * TILE_SIZE;
            if (item.isEntity) {
                // Simple character blob
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath(); ctx.ellipse(x + s(32), y + s(50), s(14), s(10), 0, 0, Math.PI*2); ctx.fill();
                const color = item.type === 'YOU' ? '#d04030' : item.type.includes('merchant') ? '#603090' : '#707070';
                rect(x + s(20), y + s(25), s(24), s(18), color); // Body
                rect(x + s(22), y + s(10), s(20), s(18), '#ffccaa'); // Head
            } else {
                // Simple feature blob
                ctx.fillStyle = p.objLight;
                if (item.type.includes('tree')) rect(x + s(26), y + s(10), s(12), s(50), '#5a4030');
                else rect(x + s(16), y + s(30), s(32), s(20), p.objLight);
            }
        });

        // 3. Enhanced Atmosphere Overlay (static, no animation)
        if (sceneData.timeOfDay === 'night') {
            // Night overlay
            ctx.fillStyle = '#000033';
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;

            // Stars for night sky
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 30; i++) {
                const starX = (i * 73 + 17) % canvas.width;
                const starY = (i * 41 + 23) % (canvas.height / 2);
                ctx.fillRect(starX, starY, 2, 2);
            }
        } else if (sceneData.timeOfDay === 'foggy') {
            // Foggy overlay
            ctx.fillStyle = 'rgba(200,200,200,0.3)';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
        } else if (sceneData.timeOfDay === 'sunset') {
            // Sunset glow
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(255,140,80,0.3)');
            gradient.addColorStop(1, 'rgba(100,50,120,0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Biome-specific atmospheric effects (static)
        if (sceneData.biome === 'cyber_city') {
            // Neon glow effect
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 5; i++) {
                const y = canvas.height - 30 - (i * 40);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
        } else if (sceneData.biome === 'graveyard') {
            // Misty ground effect
            ctx.fillStyle = 'rgba(180,180,200,0.2)';
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        } else if (sceneData.biome === 'desert') {
            // Heat shimmer (static horizontal lines)
            ctx.strokeStyle = 'rgba(255,200,100,0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.height; i += 8) {
                ctx.beginPath();
                ctx.moveTo(0, i + (i % 2) * 2);
                ctx.lineTo(canvas.width, i + (i % 2) * 2);
                ctx.stroke();
            }
        }
    };

    // PERFORMANCE: Draw scene only once when it changes (static, no animation loop)
    // This eliminates continuous CPU usage and makes loading much faster
    drawScene();

    // Scanlines (Post Process) - static retro effect
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for(let i=0; i<canvas.height; i+=4) ctx.fillRect(0, i, canvas.width, 2);

  }, [sceneData]);

  return (
    <div className="w-full aspect-video bg-black rounded-lg border-4 border-gray-700 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)] group">
      {sceneData ? (
        <canvas 
            ref={canvasRef} 
            className="w-full h-full object-contain bg-[#111]"
            style={{ imageRendering: 'pixelated', width: '100%', height: 'auto' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
             <span className="text-green-500 font-pixel tracking-widest animate-pulse">INITIALIZING...</span>
        </div>
      )}
    </div>
  );
};
