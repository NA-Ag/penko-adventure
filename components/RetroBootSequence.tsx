import React, { useEffect, useState, useRef } from 'react';

interface RetroBootSequenceProps {
  onComplete: () => void;
}

export const RetroBootSequence: React.FC<RetroBootSequenceProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'bios' | 'loading' | 'title'>('bios');
  const [loadProgress, setLoadProgress] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence stages
  useEffect(() => {
    const sequence = async () => {
      // Stage 1: BIOS screen (fast)
      playBeep(400, 0.1);
      await sleep(400);

      // Stage 2: Loading (progress bar)
      setStage('loading');
      playStartupJingle();

      for (let i = 0; i <= 100; i += 20) {
        setLoadProgress(i);
        await sleep(30);
      }
      await sleep(100);

      // Stage 3: Title screen (stays until game initializes)
      setStage('title');
      // Don't auto-complete - let the game initialization trigger completion
    };

    sequence();
  }, []);

  // Chiptune startup jingle using Web Audio API
  const playStartupJingle = () => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Simple melody: C-E-G-C (major chord arpeggio)
    const notes = [
      { freq: 523.25, time: 0 },     // C
      { freq: 659.25, time: 0.15 },  // E
      { freq: 783.99, time: 0.3 },   // G
      { freq: 1046.5, time: 0.45 },  // C (octave up)
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Chiptune square wave
      osc.frequency.value = note.freq;

      gain.gain.setValueAtTime(0.15, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + 0.15);
    });
  };

  // Simple beep sound
  const playBeep = (frequency: number, duration: number) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  return (
    <div className="w-full h-full bg-black flex items-center justify-center font-mono text-white">
      {stage === 'bios' && (
        <div className="w-full h-full bg-[#6666ff] p-8 text-[#aaaaff]">
          <div className="space-y-2 text-sm">
            <div>PENKO SYSTEM V1.0</div>
            <div>COPYRIGHT (C) 2025 PENKO ADVENTURES</div>
            <div className="mt-4">MEMORY TEST: 64K OK</div>
            <div>INITIALIZING LANGUAGE CORE...</div>
            <div>LOADING ADVENTURE ENGINE...</div>
            <div className="mt-4">
              READY.
              {showCursor && <span className="bg-[#aaaaff] text-[#6666ff] ml-1">█</span>}
            </div>
          </div>
        </div>
      )}

      {stage === 'loading' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black text-green-400 p-8">
          <div className="mb-8 text-2xl animate-pulse">LOADING...</div>

          {/* Retro progress bar */}
          <div className="w-64 border-2 border-green-400 p-1">
            <div
              className="bg-green-400 h-4 transition-all"
              style={{ width: `${loadProgress}%` }}
            />
          </div>

          <div className="mt-4 text-xs">{loadProgress}%</div>

          <div className="mt-8 text-xs opacity-60">
            ♪ LOADING ADVENTURE DATA ♪
          </div>
        </div>
      )}

      {stage === 'title' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 p-8">
          {/* Pixelated title */}
          <div className="text-6xl font-bold mb-8 text-white" style={{
            textShadow: '4px 4px 0px rgba(0,0,0,0.5), 2px 2px 0px #ff8c00'
          }}>
            PENKO
          </div>

          <div className="text-xl mb-12 text-blue-200">LANGUAGE ADVENTURE</div>

          {/* Auto-loading message */}
          <div className={`text-lg text-green-400 ${showCursor ? 'opacity-100' : 'opacity-50'}`}>
            STARTING GAME...
          </div>

          <div className="mt-12 text-xs text-blue-300">
            v1.8.0-beta | {new Date().getFullYear()} Penko Adventures
          </div>
        </div>
      )}
    </div>
  );
};
