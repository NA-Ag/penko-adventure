/**
 * Genre-Specific Animated Backgrounds
 * Creates immersive environmental effects for each narrative genre
 * Renders in the outer page area (NOT inside SetupScreen card)
 */

import React, { useEffect, useRef } from 'react';

interface GenreBackgroundProps {
  genre: string;
}

export const GenreBackground: React.FC<GenreBackgroundProps> = ({ genre }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;

    // Matrix-style falling characters for Sci-Fi with Penko-themed messages
    if (genre === 'scifi') {
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = Array(columns).fill(1);

      // Penko-themed Japanese messages (with lore easter eggs)
      const messages = [
        'ペンコを助けて', // Help Penko
        '冒険に行こう', // Let's go on an adventure
        'ペンコと学ぶ', // Learn with Penko
        '言語の旅', // Language journey
        'ペンコ頑張れ', // Penko, do your best
        '南極から来た', // Came from Antarctica (LORE: Penko's origin)
        '言葉は力だ', // Words are power (LORE: Penko's belief)
        '友達が欲しい', // I want friends (LORE: Penko's motivation)
      ];

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0ea5e9'; // Blue-500
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          // Pick a message and character from it
          const message = messages[Math.floor(Math.random() * messages.length)];
          const text = message[Math.floor(Math.random() * message.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillText(text, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      const interval = setInterval(drawMatrix, 50);
      return () => clearInterval(interval);
    }

    // Medieval particles for Fantasy (shields, swords, stars)
    else if (genre === 'fantasy') {
      interface Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        opacity: number;
        shape: 'star' | 'shield' | 'sword';
        rotation: number;
      }

      const particles: Particle[] = [];
      for (let i = 0; i < 40; i++) {
        const shapes: ('star' | 'shield' | 'sword')[] = ['star', 'shield', 'sword'];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.2,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * Math.PI * 2,
        });
      }

      // EASTER EGG: Hidden crown particle (LORE: Penko dreams of being a language champion)
      particles.push({
        x: canvas.width * 0.9,
        y: canvas.height * 0.1,
        size: 12,
        speedX: 0,
        speedY: Math.sin(Date.now() / 1000) * 0.1,
        opacity: 0.15,
        shape: 'star', // Represents crown
        rotation: 0,
      });

      const drawFantasy = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = '#a855f7'; // Purple-500

          if (p.shape === 'star') {
            // Draw 4-point star
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
              const angle = (i * Math.PI) / 2;
              ctx.lineTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
            }
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === 'shield') {
            // Draw shield shape
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            // Draw sword (line)
            ctx.fillRect(-1, -p.size, 2, p.size * 2);
          }

          ctx.restore();

          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += 0.01;

          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });

        animationId = requestAnimationFrame(drawFantasy);
      };

      drawFantasy();
      return () => cancelAnimationFrame(animationId);
    }

    // Dracula theme for Horror (reds and blacks with bat silhouettes)
    else if (genre === 'horror') {
      let pulse = 0;

      interface Bat {
        x: number;
        y: number;
        speedX: number;
        speedY: number;
        wingFlap: number;
      }

      const bats: Bat[] = [];
      for (let i = 0; i < 8; i++) {
        bats.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 1,
          wingFlap: Math.random() * Math.PI * 2,
        });
      }

      // EASTER EGG: One bat flies in a heart pattern (LORE: Penko fears the dark but has courage)
      let heartBatAngle = 0;

      const drawHorror = () => {
        pulse += 0.02;
        const intensity = Math.sin(pulse) * 0.1 + 0.15;

        // Dark red pulsing background
        ctx.fillStyle = `rgba(127, 29, 29, ${intensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw bats
        bats.forEach((bat, index) => {
          ctx.fillStyle = '#000';
          const wingSpan = Math.sin(bat.wingFlap) * 8 + 12;

          // EASTER EGG: First bat follows heart path
          if (index === 0) {
            heartBatAngle += 0.02;
            const scale = 30;
            bat.x = canvas.width / 2 + scale * 16 * Math.pow(Math.sin(heartBatAngle), 3);
            bat.y = canvas.height / 2 - scale * (13 * Math.cos(heartBatAngle) - 5 * Math.cos(2 * heartBatAngle) - 2 * Math.cos(3 * heartBatAngle) - Math.cos(4 * heartBatAngle));
          }

          // Bat body
          ctx.beginPath();
          ctx.arc(bat.x, bat.y, 4, 0, Math.PI * 2);
          ctx.fill();

          // Wings
          ctx.beginPath();
          ctx.moveTo(bat.x, bat.y);
          ctx.lineTo(bat.x - wingSpan, bat.y - 6);
          ctx.lineTo(bat.x - wingSpan / 2, bat.y);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(bat.x, bat.y);
          ctx.lineTo(bat.x + wingSpan, bat.y - 6);
          ctx.lineTo(bat.x + wingSpan / 2, bat.y);
          ctx.closePath();
          ctx.fill();

          if (index !== 0) {
            bat.x += bat.speedX;
            bat.y += bat.speedY;
          }
          bat.wingFlap += 0.1;

          if (index !== 0 && (bat.x < 0 || bat.x > canvas.width)) bat.speedX *= -1;
          if (index !== 0 && (bat.y < 0 || bat.y > canvas.height)) bat.speedY *= -1;
        });

        animationId = requestAnimationFrame(drawHorror);
      };

      drawHorror();
      return () => cancelAnimationFrame(animationId);
    }

    // Tumbleweeds for Western
    else if (genre === 'western') {
      interface Tumbleweed {
        x: number;
        y: number;
        size: number;
        speedX: number;
        rotation: number;
      }

      const tumbleweeds: Tumbleweed[] = [];
      for (let i = 0; i < 6; i++) {
        tumbleweeds.push({
          x: Math.random() * canvas.width,
          y: canvas.height - Math.random() * 200,
          size: Math.random() * 20 + 15,
          speedX: Math.random() * 2 + 1,
          rotation: 0,
        });
      }

      // EASTER EGG: Golden tumbleweed (LORE: Penko seeks the golden word)
      tumbleweeds.push({
        x: -50,
        y: canvas.height - 150,
        size: 25,
        speedX: 0.5,
        rotation: 0,
      });
      let goldenTumbleweedIndex = tumbleweeds.length - 1;

      const drawWestern = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(234, 88, 12, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        tumbleweeds.forEach((t, index) => {
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(t.rotation);

          // EASTER EGG: Golden tumbleweed
          if (index === goldenTumbleweedIndex) {
            ctx.strokeStyle = '#fbbf24'; // Amber-400 (golden)
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
          } else {
            ctx.strokeStyle = '#92400e'; // Brown-800
          }
          ctx.lineWidth = 2;

          // Draw tumbleweed as circle with cross-hatching
          ctx.beginPath();
          ctx.arc(0, 0, t.size, 0, Math.PI * 2);
          ctx.stroke();

          // Cross lines
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * t.size, Math.sin(angle) * t.size);
            ctx.stroke();
          }

          ctx.restore();

          t.x += t.speedX;
          t.rotation += t.speedX * 0.05;

          if (t.x > canvas.width + t.size) {
            t.x = -t.size;
            t.y = canvas.height - Math.random() * 200;
          }
        });

        animationId = requestAnimationFrame(drawWestern);
      };

      drawWestern();
      return () => cancelAnimationFrame(animationId);
    }

    // Glitchy interface for Cyberpunk (matrix-inspired with glitches)
    else if (genre === 'cyberpunk') {
      interface GlitchLine {
        y: number;
        height: number;
        opacity: number;
        lifetime: number;
      }

      const glitches: GlitchLine[] = [];
      const fontSize = 12;
      const columns = Math.floor(canvas.width / fontSize);
      const code: string[] = Array(columns).fill('');

      const codeChars = '01アイウエオカキクケコ<>[]{}()';

      // EASTER EGG: Hidden "PENKO" in binary (LORE: Penko's digital signature)
      const penkoBinary = '01010000 01000101 01001110 01001011 01001111'; // "PENKO" in ASCII binary
      let binaryMessageX = canvas.width * 0.8;
      let binaryMessageY = canvas.height * 0.2;

      const drawCyberpunk = () => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Code rain (similar to sci-fi but pink)
        ctx.fillStyle = '#ec4899'; // Pink-500
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < columns; i++) {
          if (Math.random() > 0.98) {
            code[i] = codeChars[Math.floor(Math.random() * codeChars.length)];
            const y = Math.random() * canvas.height;
            ctx.fillText(code[i], i * fontSize, y);
          }
        }

        // Random glitch bars
        if (Math.random() > 0.95) {
          glitches.push({
            y: Math.random() * canvas.height,
            height: Math.random() * 30 + 10,
            opacity: Math.random() * 0.3 + 0.2,
            lifetime: 3,
          });
        }

        // Draw and update glitches
        glitches.forEach((g, index) => {
          ctx.fillStyle = `rgba(236, 72, 153, ${g.opacity})`;
          ctx.fillRect(0, g.y, canvas.width, g.height);

          g.lifetime--;
          if (g.lifetime <= 0) {
            glitches.splice(index, 1);
          }
        });

        // EASTER EGG: Display "PENKO" in binary
        ctx.fillStyle = '#ec4899';
        ctx.font = '10px monospace';
        ctx.globalAlpha = 0.3;
        ctx.fillText(penkoBinary, binaryMessageX, binaryMessageY);
        ctx.globalAlpha = 1;

        animationId = requestAnimationFrame(drawCyberpunk);
      };

      drawCyberpunk();
      return () => cancelAnimationFrame(animationId);
    }

    // Appearing/disappearing objects with fog for Mystery

    else if (genre === 'time_travel' || genre === 'steampunk') {
      const gears: any[] = [];
      for (let i = 0; i < 15; i++) {
        gears.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 30 + 10,
          teeth: Math.floor(Math.random() * 8) + 6,
          rotation: Math.random() * Math.PI * 2,
          speed: (Math.random() - 0.5) * 0.02,
          opacity: Math.random() * 0.2 + 0.1,
          color: genre === 'time_travel' ? '#6366f1' : '#d97706' // Indigo for time, amber for steampunk
        });
      }

      const drawGears = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gears.forEach(g => {
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.rotate(g.rotation);
          ctx.globalAlpha = g.opacity;
          ctx.fillStyle = g.color;
          ctx.strokeStyle = g.color;
          ctx.lineWidth = 2;

          ctx.beginPath();
          for (let i = 0; i < g.teeth; i++) {
            const angle = (i * Math.PI * 2) / g.teeth;
            const nextAngle = ((i + 0.5) * Math.PI * 2) / g.teeth;
            const outerRadius = g.radius + 5;
            
            ctx.lineTo(Math.cos(angle) * g.radius, Math.sin(angle) * g.radius);
            ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
            ctx.lineTo(Math.cos(nextAngle) * outerRadius, Math.sin(nextAngle) * outerRadius);
            ctx.lineTo(Math.cos(nextAngle) * g.radius, Math.sin(nextAngle) * g.radius);
          }
          ctx.closePath();
          ctx.stroke();

          // Inner circle
          ctx.beginPath();
          ctx.arc(0, 0, g.radius * 0.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
          g.rotation += g.speed;
        });
        animationId = requestAnimationFrame(drawGears);
      };
      drawGears();
    }
    else if (genre === 'pirate' || genre === 'survival') {
      const waves: any[] = [];
      for (let i = 0; i < 5; i++) {
        waves.push({
          y: canvas.height * (0.6 + i * 0.1),
          amplitude: Math.random() * 20 + 10,
          frequency: Math.random() * 0.01 + 0.005,
          offset: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
          color: genre === 'pirate' ? `rgba(13, 148, 136, ${0.1 - i * 0.015})` : `rgba(22, 163, 74, ${0.1 - i * 0.015})` // Teal for pirate, green for survival
        });
      }

      const drawWaves = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waves.forEach(w => {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height);
          for (let x = 0; x <= canvas.width; x += 20) {
            const y = w.y + Math.sin(x * w.frequency + w.offset) * w.amplitude;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
          w.offset += w.speed;
        });
        animationId = requestAnimationFrame(drawWaves);
      };
      drawWaves();
    }
    else if (genre === 'post_apocalyptic' || genre === 'spy') {
      const staticLines: any[] = [];
      for(let i=0; i<10; i++) {
        staticLines.push({
           y: Math.random() * canvas.height,
           speed: Math.random() * 5 + 2,
           height: Math.random() * 4 + 1,
           opacity: Math.random() * 0.15 + 0.05
        });
      }

      const drawStatic = () => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Fade out effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = genre === 'post_apocalyptic' ? '#ca8a04' : '#9ca3af'; // Yellow vs Gray
        
        // Random noise dots
        for(let i=0; i<50; i++) {
            ctx.globalAlpha = Math.random() * 0.2;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }

        ctx.globalAlpha = 1;
        staticLines.forEach(line => {
           ctx.fillStyle = `rgba(${genre === 'post_apocalyptic' ? '202, 138, 4' : '156, 163, 175'}, ${line.opacity})`;
           ctx.fillRect(0, line.y, canvas.width, line.height);
           line.y += line.speed;
           if(line.y > canvas.height) line.y = 0;
        });
        animationId = requestAnimationFrame(drawStatic);
      };
      drawStatic();
    }
    else if (genre === 'slice_of_life' || genre === 'school' || genre === 'fairy_tale') {
      const petals: any[] = [];
      for (let i = 0; i < 30; i++) {
        petals.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 4,
          speedY: Math.random() * 1 + 0.5,
          speedX: Math.random() * 2 - 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          color: genre === 'slice_of_life' ? '#f43f5e' : (genre === 'fairy_tale' ? '#e879f9' : '#60a5fa') // Rose, Fuchsia, Blue
        });
      }

      const drawPetals = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = p.color;
          
          ctx.beginPath();
          // Draw petal shape
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.speedY;
          p.x += p.speedX + Math.sin(Date.now() / 1000 + p.y * 0.01) * 0.5; // Flutter effect
          p.rotation += p.rotationSpeed;

          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        });
        animationId = requestAnimationFrame(drawPetals);
      };
      drawPetals();
    }
    else if (genre === 'superhero') {
      const beams: any[] = [];
      for(let i=0; i<8; i++) {
        beams.push({
           x: Math.random() * canvas.width,
           width: Math.random() * 40 + 10,
           speed: Math.random() * 15 + 5,
           opacity: Math.random() * 0.2 + 0.1,
           active: false,
           timer: Math.random() * 100
        });
      }
      const drawBeams = () => {
         ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
         beams.forEach(b => {
            b.timer--;
            if(b.timer <= 0) {
               b.active = true;
               b.timer = Math.random() * 100 + 50;
               b.x = Math.random() * canvas.width;
            }
            if(b.active) {
                const gradient = ctx.createLinearGradient(b.x, 0, b.x + b.width, 0);
                gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
                gradient.addColorStop(0.5, `rgba(56, 189, 248, ${b.opacity})`); // Sky blue
                gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(b.x, 0, b.width, canvas.height);
                b.opacity -= 0.01;
                if(b.opacity <= 0) {
                   b.active = false;
                   b.opacity = Math.random() * 0.2 + 0.1;
                }
            }
         });
         animationId = requestAnimationFrame(drawBeams);
      };
      drawBeams();
    }

    else if (genre === 'mystery') {
      interface FogLayer {
        y: number;
        speed: number;
        opacity: number;
        fadeIn: boolean;
      }

      interface MysteryObject {
        x: number;
        y: number;
        size: number;
        opacity: number;
        fadeIn: boolean;
        shape: 'magnifyingGlass' | 'key' | 'footprint';
      }

      const fog: FogLayer[] = [];
      for (let i = 0; i < 5; i++) {
        fog.push({
          y: Math.random() * canvas.height,
          speed: Math.random() * 0.3 + 0.1,
          opacity: Math.random() * 0.15 + 0.05,
          fadeIn: Math.random() > 0.5,
        });
      }

      const objects: MysteryObject[] = [];
      for (let i = 0; i < 8; i++) {
        const shapes: ('magnifyingGlass' | 'key' | 'footprint')[] = ['magnifyingGlass', 'key', 'footprint'];
        objects.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 20 + 15,
          opacity: 0,
          fadeIn: true,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }

      // EASTER EGG: Special question mark that pulses (LORE: Penko's eternal curiosity)
      objects.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        size: 30,
        opacity: 0.1,
        fadeIn: true,
        shape: 'magnifyingGlass', // Will be drawn as "?"
      });
      const questionMarkIndex = objects.length - 1;

      const drawMystery = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw fog layers with fade in/out
        fog.forEach((f) => {
          ctx.fillStyle = `rgba(148, 163, 184, ${f.opacity})`;
          ctx.fillRect(0, f.y, canvas.width, 100);

          f.y -= f.speed;
          if (f.y < -100) f.y = canvas.height;

          // Fade fog in and out
          if (f.fadeIn) {
            f.opacity += 0.001;
            if (f.opacity > 0.2) f.fadeIn = false;
          } else {
            f.opacity -= 0.001;
            if (f.opacity < 0.05) f.fadeIn = true;
          }
        });

        // Draw appearing/disappearing mystery objects
        objects.forEach((obj, index) => {
          ctx.save();
          ctx.globalAlpha = obj.opacity;

          // EASTER EGG: Question mark is golden
          if (index === questionMarkIndex) {
            ctx.fillStyle = '#fbbf24'; // Amber-400
            ctx.strokeStyle = '#f59e0b'; // Amber-500
            ctx.font = `${obj.size}px monospace`;
            ctx.fillText('?', obj.x - obj.size / 4, obj.y + obj.size / 4);
          } else {
            ctx.fillStyle = '#64748b'; // Slate-500
            ctx.strokeStyle = '#1e293b'; // Slate-800
            ctx.lineWidth = 2;

            if (obj.shape === 'magnifyingGlass') {
              ctx.beginPath();
              ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(obj.x + obj.size / 3, obj.y + obj.size / 3);
              ctx.lineTo(obj.x + obj.size, obj.y + obj.size);
              ctx.stroke();
            } else if (obj.shape === 'key') {
              ctx.fillRect(obj.x, obj.y, obj.size / 3, obj.size);
              ctx.fillRect(obj.x, obj.y, obj.size, obj.size / 3);
            } else {
              // Footprint
              ctx.fillRect(obj.x, obj.y, obj.size / 2, obj.size);
              for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(obj.x + i * 6, obj.y - 5, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          ctx.restore();

          // Fade in and out
          if (index === questionMarkIndex) {
            // Special pulsing for question mark
            if (obj.fadeIn) {
              obj.opacity += 0.005;
              if (obj.opacity > 0.3) obj.fadeIn = false;
            } else {
              obj.opacity -= 0.005;
              if (obj.opacity < 0.1) obj.fadeIn = true;
            }
          } else {
            if (obj.fadeIn) {
              obj.opacity += 0.01;
              if (obj.opacity > 0.6) obj.fadeIn = false;
            } else {
              obj.opacity -= 0.01;
              if (obj.opacity < 0) {
                obj.fadeIn = true;
                obj.x = Math.random() * canvas.width;
                obj.y = Math.random() * canvas.height;
              }
            }
          }
        });

        animationId = requestAnimationFrame(drawMystery);
      };

      drawMystery();
      return () => cancelAnimationFrame(animationId);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [genre]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};
