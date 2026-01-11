
import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isListening: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isListening }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyser || !isListening) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!isListening) return;
            
            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Styling
            ctx.fillStyle = 'rgba(0, 255, 128, 0.2)'; // Background glow
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2; // Scale down

                // Gradient Color
                const r = barHeight + (25 * (i/bufferLength));
                const g = 250 * (i/bufferLength);
                const b = 50;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
            // Clear canvas on unmount/stop
            if (canvasRef.current) {
                const c = canvasRef.current.getContext('2d');
                c?.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
    }, [analyser, isListening]);

    if (!isListening) return null;

    return (
        <canvas 
            ref={canvasRef} 
            width={300} 
            height={50} 
            className="absolute bottom-0 left-0 w-full h-full opacity-30 pointer-events-none rounded-lg"
        />
    );
};
