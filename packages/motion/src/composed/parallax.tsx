'use client';

/**
 * 多层视差：每层以不同速度因子跟随滚动位移（负值反向）。
 * 仅位移 transform，合成器友好。
 */

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';

export interface ParallaxLayerSpec {
  /** 速度因子：0.3 = 滚动 100px 该层移动 30px；负值反向 */
  speed: number;
  node: ReactNode;
}

export interface ParallaxProps {
  layers: ParallaxLayerSpec[];
  /** 位移弹簧平滑（0 关闭，视差一般不需要） */
  smooth?: number;
  style?: React.CSSProperties;
  className?: string;
}

function useLayerOffset(
  containerRef: React.RefObject<HTMLDivElement | null>,
  speed: number,
  smooth: number,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  const springed = useSpring(raw, { stiffness: 150, damping: 30 });
  return smooth > 0 ? springed : raw;
}

export function Parallax({ layers, smooth = 0, style, className }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', ...style }}>
      {layers.map((layer, i) => (
        <ParallaxLayer
          key={i}
          containerRef={containerRef}
          speed={layer.speed}
          smooth={smooth}
        >
          {layer.node}
        </ParallaxLayer>
      ))}
    </div>
  );
}

function ParallaxLayer({
  containerRef,
  speed,
  smooth,
  children,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  speed: number;
  smooth: number;
  children: ReactNode;
}) {
  const y = useLayerOffset(containerRef, speed, smooth);
  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}
