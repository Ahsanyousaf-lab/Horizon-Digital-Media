import React, { useEffect, useRef } from 'react';
import { ThemeColor } from '../types';
import { THEMES } from '../data/websiteData';

interface BackgroundAnimationProps {
  colorTheme: ThemeColor;
  isLightMode: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  colorTheme,
  isLightMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const theme = THEMES[colorTheme] || THEMES.teal;
    const hexToRgb = (hex: string) => {
      const bigint = parseInt(hex.replace('#', ''), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r}, ${g}, ${b}`;
    };

    const primaryRgb = hexToRgb(theme.primary);
    const secondaryRgb = hexToRgb(theme.secondary);

    // Generate particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient glowing wave gradient
      const waveGrad = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 0.7) * (width * 0.25),
        height * 0.35 + Math.cos(time * 0.5) * (height * 0.2),
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      waveGrad.addColorStop(0, `rgba(${secondaryRgb}, ${isLightMode ? 0.05 : 0.08})`);
      waveGrad.addColorStop(0.5, `rgba(${primaryRgb}, ${isLightMode ? 0.02 : 0.04})`);
      waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * (isLightMode ? 0.12 : 0.18);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${secondaryRgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${secondaryRgb}, ${isLightMode ? p.alpha * 0.6 : p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${primaryRgb}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorTheme, isLightMode]);

  const [customBgVideo, setCustomBgVideo] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem('horizon_bg_video');
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    const handleStorage = () => {
      try {
        setCustomBgVideo(localStorage.getItem('horizon_bg_video'));
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <>
      {customBgVideo ? (
        <video
          key={customBgVideo}
          src={customBgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-40 transition-opacity duration-700"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
          style={{ opacity: isLightMode ? 0.55 : 0.75 }}
        />
      )}
    </>
  );
};
