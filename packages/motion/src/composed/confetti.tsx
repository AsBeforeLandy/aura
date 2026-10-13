'use client';

/**
 * 庆祝粒子（canvas 2d）：`fire` 计数器变化时发射一轮。
 * reduced-motion 下不渲染任何内容；粒子全部离场后自动停止 rAF。
 */

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export interface ConfettiProps {
  /** 发射触发器：计数器 +1 发射一轮 */
  fire: number;
  count?: number;
  /** 发射原点（相对视口比例 0~1） */
  origin?: { x: number; y: number };
  colors?: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
  decay: number;
  rect: boolean;
}

const DEFAULT_COLORS = [
  '#534ab7',
  '#1d9e75',
  '#d85a30',
  '#d4537e',
  '#378add',
  '#ba7517',
];

export function Confetti({
  fire,
  count = 120,
  origin = { x: 0.5, y: 0.6 },
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const lastFire = useRef(0);

  useEffect(() => {
    if (!fire || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ox = origin.x * canvas.width;
    const oy = origin.y * canvas.height;

    const parts: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      life: 1,
      decay: 0.008 + Math.random() * 0.008,
      rect: Math.random() > 0.5,
    }));

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of parts) {
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.rect) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf = requestAnimationFrame(tick);
    lastFire.current = fire;
    return () => cancelAnimationFrame(raf);
    // origin/colors 变化不重发；fire 是唯一触发器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire, reduced, count]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
