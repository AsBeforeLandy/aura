'use client';

/**
 * 庆祝粒子（canvas 2d，物理精修版）：`fire` 计数器变化时发射一轮。
 *
 * 精修点：
 * - 形态：纸条（1:2.6）+ 圆点，纸条以 scaleY 正弦翻转模拟 3D 翻面；
 * - 物理：初速呈上抛扇形分布（±60°），空气阻力 0.985/帧，
 *   翻转速度与下落速度耦合，末段低速时水平摇摆（纸片飘落感）；
 * - reduced-motion 下不渲染任何内容；粒子全部离场后自动停止 rAF。
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
  /** 翻面相位（scaleY = sin(tilt) 模拟 3D 翻转） */
  tilt: number;
  tiltSpeed: number;
  w: number;
  h: number;
  color: string;
  life: number;
  decay: number;
  ribbon: boolean;
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

    const parts: Particle[] = Array.from({ length: count }, (_, i) => {
      // 上抛扇形：-90° ± 60°
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * ((Math.PI * 2) / 3);
      const speed = 8 + Math.random() * 9;
      const ribbon = Math.random() > 0.55;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: 0.12 + Math.random() * 0.22,
        w: ribbon ? 5 + Math.random() * 4 : 7 + Math.random() * 5,
        h: ribbon ? 16 + Math.random() * 8 : 7 + Math.random() * 5,
        color: colors[i % colors.length],
        life: 1,
        decay: 0.007 + Math.random() * 0.007,
        ribbon,
      };
    });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of parts) {
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive = true;

        // 空气阻力 + 重力
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.32;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        // 翻面速度与下落速度耦合；低速末段水平摇摆（纸片飘落）
        p.tilt += p.tiltSpeed * (Math.abs(p.vy) / 14 + 0.35);
        if (p.vy > -1 && p.life < 0.7) p.x += Math.sin(p.tilt * 0.5) * 0.35;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.ribbon) {
          // 纸条：scaleY 正弦翻转模拟 3D 翻面
          ctx.scale(1, Math.sin(p.tilt));
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
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
