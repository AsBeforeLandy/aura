'use client';

/**
 * 3D 倾斜卡片：指针位置驱动 rotateX / rotateY（弹簧平滑），
 * 可选跟随指针的光泽层（radial-gradient）。
 *
 * - 只动画 transform 与 opacity（合成器友好）；
 * - 触屏（无 mousemove）与 reduced-motion 下退化为静态卡片；
 * - 光泽层 pointer-events: none，不影响内部交互。
 */

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

export interface TiltCardProps {
  children: ReactNode;
  /** 最大倾斜角度（度） */
  maxTilt?: number;
  /** 悬停时的放大比例 */
  scale?: number;
  /** 是否显示跟随指针的光泽 */
  glare?: boolean;
  /** 光泽强度（0~1） */
  glareOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function TiltCard({
  children,
  maxTilt = 8,
  scale = 1.02,
  glare = true,
  glareOpacity: glareStrength = 0.22,
  className,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // 指针相对位置（0~1，0.5 为中心）
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 220,
    damping: 24,
  });
  const rotY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 220,
    damping: 24,
  });
  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glareBg = useTransform(
    [glareX, glareY],
    ([x, y]: string[]) =>
      `radial-gradient(240px circle at ${x} ${y}, rgba(255,255,255,0.65), transparent 62%)`,
  );
  const glareAlpha = useMotionValue(0);

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const onEnter = () => glareAlpha.set(glare ? glareStrength : 0);
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareAlpha.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileHover={{ scale }}
      style={{
        position: 'relative',
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 800,
        ...style,
      }}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: glareBg,
            opacity: glareAlpha,
          }}
        />
      )}
    </motion.div>
  );
}
