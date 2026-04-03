import React, { useEffect, useState, useRef } from 'react';
import { PENKO_ANIMATIONS, PENKO_PALETTE, AnimationName } from './penko_anim';
import { TRANSLATIONS } from '../translations';
import { Language } from '../types';
import { EDUCATIONAL_TRANSLATIONS } from '../data/educational/translations';

interface SegaBootSequenceProps {
  onComplete: () => void;
  theme: string;
  nativeLanguage: Language;
  isEducational?: boolean;
}

export const SegaBootSequence: React.FC<SegaBootSequenceProps> = ({ onComplete, theme, nativeLanguage, isEducational }) => {
  const [stage, setStage] = useState<'license' | 'sega' | 'title'>('license');
  const [penkoFrame, setPenkoFrame] = useState(0);
  const [penkoX, setPenkoX] = useState(-50); // Start off-screen left
  const [penkoAction, setPenkoAction] = useState<AnimationName>('walk_right');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const T = TRANSLATIONS[nativeLanguage] || TRANSLATIONS[Language.ENGLISH];
  const ET = (EDUCATIONAL_TRANSLATIONS[nativeLanguage] || EDUCATIONAL_TRANSLATIONS[Language.ENGLISH]) as any;

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // The iconic "SE-GA" choir synth
  const playSegaChoir = () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.setValueAtTime(311.13, now); // Eb4
    osc2.frequency.setValueAtTime(312.5, now);  
    
    osc1.frequency.setValueAtTime(349.23, now + 0.6); // F4
    osc2.frequency.setValueAtTime(351.0, now + 0.6);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1); 
    gain.gain.setValueAtTime(0.3, now + 0.5);
    gain.gain.linearRampToValueAtTime(0, now + 0.6); 
    gain.gain.linearRampToValueAtTime(0.3, now + 0.65); 
    gain.gain.linearRampToValueAtTime(0, now + 1.8); 
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  };

  const playRingSound = () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, now); // C6
    osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.1); // G6
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  };

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      await sleep(1000);
      if (!isMounted) return;
      
      setStage('sega');
      playSegaChoir();
      
      for (let i = -50; i <= 150; i += 4) {
        if (!isMounted) return;
        setPenkoX(i);
        setPenkoFrame(prev => (prev + 1) % PENKO_ANIMATIONS.walk_right.length);
        
        if (i === 50) {
          setPenkoAction('jump_right');
          setPenkoFrame(0);
          playRingSound();
        } else if (i === 70) {
          setPenkoAction('walk_right');
        }
        
        await sleep(30);
      }
      
      await sleep(1000);
      if (!isMounted) return;

      setStage('title');
      setPenkoAction('idle');
      setPenkoFrame(0);
    };

    runSequence();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Sega Logo Phase canvas drawing
  useEffect(() => {
    if (stage !== 'sega') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const animation = PENKO_ANIMATIONS[penkoAction];
    const frameData = animation[penkoFrame % animation.length];
    
    // Scale pixel up to 4 for a 320x240 internal logical size
    const pixelSize = 4; 
    
    let yOffset = 0;
    if (penkoAction === 'jump_right') {
        const normalizedX = penkoX - 60; 
        yOffset = Math.max(0, 50 - (normalizedX * normalizedX * 0.5));
    }
    
    // Convert 0-100 percentage to 320 width
    const startX = (320 * (penkoX / 100)) - (frameData[0].length * pixelSize) / 2;
    const startY = (240 / 2) + 10 - yOffset;

    for (let y = 0; y < frameData.length; y++) {
      for (let x = 0; x < frameData[y].length; x++) {
        const colorIndex = frameData[y][x];
        if (colorIndex > 0 && PENKO_PALETTE[colorIndex]) {
          ctx.fillStyle = PENKO_PALETTE[colorIndex];
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [stage, penkoX, penkoFrame, penkoAction]);

  // Title Phase canvas drawing
  useEffect(() => {
    if (stage !== 'title') return;

    let intervalId = setInterval(() => {
        setPenkoFrame(prev => (prev + 1) % PENKO_ANIMATIONS.idle.length);
    }, 250);

    return () => clearInterval(intervalId);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'title') return;

    const canvas = titleCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const animation = PENKO_ANIMATIONS.idle;
    const frameData = animation[penkoFrame % animation.length];
    const pixelSize = 6;
    
    const startX = (canvas.width / 2) - (frameData[0].length * pixelSize) / 2;
    // Position it center-ish
    const startY = (canvas.height / 2) - 10;

    for (let y = 0; y < frameData.length; y++) {
      for (let x = 0; x < frameData[y].length; x++) {
        const colorIndex = frameData[y][x];
        if (colorIndex > 0 && PENKO_PALETTE[colorIndex]) {
          ctx.fillStyle = PENKO_PALETTE[colorIndex];
          ctx.fillRect(startX + x * pixelSize, startY + y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }, [stage, penkoFrame]);

  const getThemeConfig = () => {
    switch (theme) {
      case 'scifi': return { bg: 'from-blue-900 to-gray-900', title: T.boot_title_scifi, sub: T.boot_sub_scifi, textCol: '#aaddff', stroke: '#003366', subBg: '#004488' };
      case 'horror': return { bg: 'from-red-900 to-black', title: T.boot_title_horror, sub: T.boot_sub_horror, textCol: '#ff0000', stroke: '#440000', subBg: '#660000' };
      case 'mystery': return { bg: 'from-gray-700 to-gray-900', title: T.boot_title_mystery, sub: T.boot_sub_mystery, textCol: '#e0e0e0', stroke: '#333333', subBg: '#444444' };
      case 'western': return { bg: 'from-orange-800 to-yellow-900', title: T.boot_title_western, sub: T.boot_sub_western, textCol: '#ffcc66', stroke: '#663300', subBg: '#884400' };
      case 'cyberpunk': return { bg: 'from-purple-900 to-black', title: T.boot_title_cyberpunk, sub: T.boot_sub_cyberpunk, textCol: '#ff00ff', stroke: '#00ffff', subBg: '#aa00aa' };
      case 'post_apocalyptic': return { bg: 'from-yellow-900 to-black', title: T.boot_title_post_apocalyptic || 'PENKO FALLOUT', sub: T.boot_sub_post_apocalyptic || 'SURVIVAL', textCol: '#eab308', stroke: '#854d0e', subBg: '#ca8a04' };
      case 'pirate': return { bg: 'from-teal-900 to-blue-950', title: T.boot_title_pirate || 'PENKO SEAS', sub: T.boot_sub_pirate || 'TREASURE', textCol: '#2dd4bf', stroke: '#115e59', subBg: '#0d9488' };
      case 'spy': return { bg: 'from-gray-900 to-black', title: T.boot_title_spy || 'AGENT PENKO', sub: T.boot_sub_spy || 'COVERT', textCol: '#f3f4f6', stroke: '#374151', subBg: '#4b5563' };
      case 'slice_of_life': return { bg: 'from-rose-800 to-orange-900', title: T.boot_title_slice_of_life || 'PENKO LIFE', sub: T.boot_sub_slice_of_life || 'EVERYDAY', textCol: '#f43f5e', stroke: '#9f1239', subBg: '#e11d48' };
      case 'survival': return { bg: 'from-green-900 to-emerald-950', title: T.boot_title_survival || 'PENKO WILD', sub: T.boot_sub_survival || 'CRAFTING', textCol: '#22c55e', stroke: '#14532d', subBg: '#16a34a' };
      case 'superhero': return { bg: 'from-sky-900 to-blue-950', title: T.boot_title_superhero || 'SUPER PENKO', sub: T.boot_sub_superhero || 'HEROIC', textCol: '#38bdf8', stroke: '#0c4a6e', subBg: '#0284c7' };
      case 'fairy_tale': return { bg: 'from-fuchsia-900 to-purple-950', title: T.boot_title_fairy_tale || 'PENKO FABLES', sub: T.boot_sub_fairy_tale || 'MAGIC', textCol: '#e879f9', stroke: '#701a75', subBg: '#c026d3' };
      case 'steampunk': return { bg: 'from-amber-900 to-yellow-950', title: T.boot_title_steampunk || 'BRASS PENKO', sub: T.boot_sub_steampunk || 'GEARS', textCol: '#fbbf24', stroke: '#78350f', subBg: '#d97706' };
      case 'school': return { bg: 'from-blue-800 to-indigo-950', title: T.boot_title_school || 'PENKO ACADEMY', sub: T.boot_sub_school || 'STUDENT', textCol: '#60a5fa', stroke: '#1e3a8a', subBg: '#2563eb' };
      case 'time_travel': return { bg: 'from-indigo-900 to-violet-950', title: T.boot_title_time_travel || 'PENKO CHRONO', sub: T.boot_sub_time_travel || 'EPOCH', textCol: '#818cf8', stroke: '#312e81', subBg: '#4f46e5' };
      case 'fantasy':
      default: return { bg: 'from-green-800 to-blue-900', title: T.boot_title_fantasy, sub: T.boot_sub_fantasy, textCol: '#ffcc00', stroke: '#004400', subBg: '#cc0000' };
    }
  };

  const themeConfig = getThemeConfig();

  return (
    <div className="w-full aspect-[4/3] bg-black flex items-center justify-center font-pixel relative overflow-hidden" onClick={onComplete}>
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>

      {stage === 'license' && (
        <div className="text-white text-center text-[10px] md:text-sm leading-loose max-w-lg p-4 animate-fade-in uppercase tracking-widest">
          PRODUCED BY OR UNDER LICENSE FROM
          <br /><br />
          PENKO ENTERPRISES LTD.
        </div>
      )}

      {stage === 'sega' && (
        <div className="w-full h-full relative flex flex-col items-center justify-center bg-white animate-fade-in">
          <div className="relative z-10 -mt-12">
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter" style={{
              color: '#0044cc',
              WebkitTextStroke: '1px white',
              textShadow: '0 0 5px rgba(0,68,204,0.5), -2px 0 0 #0044cc, -4px 0 0 #0044cc, -6px 0 0 #0044cc',
              letterSpacing: '-0.05em'
            }}>
              PENKO
            </h1>
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white opacity-80 z-20"></div>
          </div>
          
          <canvas 
            ref={canvasRef}
            width={320} 
            height={240} 
            className="absolute inset-0 w-full h-full z-30 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}

      {stage === 'title' && (
        <div className={`w-full h-full flex flex-col items-center justify-between bg-gradient-to-b ${themeConfig.bg} py-8 px-4 animate-fade-in relative`}>
            
          <canvas 
            ref={titleCanvasRef}
            width={320} 
            height={240} 
            className="absolute inset-0 w-full h-full z-10 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />

          <div className="relative z-20 text-center pointer-events-none flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-black mb-1 tracking-tighter italic uppercase" style={{
                color: themeConfig.textCol,
                WebkitTextStroke: `1px ${themeConfig.stroke}`,
                textShadow: `2px 2px 0px ${themeConfig.stroke}, 4px 4px 0px rgba(0,0,0,0.5)`
              }}>
                {themeConfig.title}
              </div>

              <div className="border-2 border-white text-white px-4 py-1 transform -skew-x-12 inline-block shadow-[4px_4px_0_rgba(0,0,0,0.5)]" style={{ backgroundColor: themeConfig.subBg }}>
                  <div className="transform skew-x-12 text-base md:text-xl font-bold tracking-widest uppercase">
                      {T[theme] || theme}
                  </div>
              </div>
          </div>

          <div className="relative z-20 text-[10px] md:text-xs text-white animate-pulse font-bold tracking-widest drop-shadow-[1px_1px_0_#000] pointer-events-none uppercase">
            {T.boot_begin_typing}
          </div>
        </div>
      )}
    </div>
  );
};
