import { useEffect, useRef, useState } from 'react';
import { AUDIO } from '../constants';

export function useAudio() {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context on user interaction or mount
    useEffect(() => {
        if (soundEnabled && !audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
            }
        }
    }, [soundEnabled]);

    const playSFX = (type: 'type' | 'send' | 'receive') => {
        if (!soundEnabled || !audioCtxRef.current) return;
        
        const ctx = audioCtxRef.current;
        // Resume context if suspended (browser policy)
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'type') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(AUDIO.CLICK_FREQUENCY, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + AUDIO.CLICK_DURATION);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + AUDIO.CLICK_DURATION);
            osc.start(now);
            osc.stop(now + AUDIO.CLICK_DURATION);
        } else if (type === 'send') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(AUDIO.SEND_FREQUENCY, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'receive') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(AUDIO.RECEIVE_FREQUENCY, now);
            osc.frequency.linearRampToValueAtTime(440, now + 0.1);
            osc.frequency.linearRampToValueAtTime(220, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    };

    return { soundEnabled, setSoundEnabled, playSFX, audioCtxRef };
}