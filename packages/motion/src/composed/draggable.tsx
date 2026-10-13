'use client';

/**
 * 自由拖拽：约束在包装容器内、可选网格吸附与惯性。
 * reduced-motion 下退化为静态内容（不可拖）。
 */

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';

export interface DraggableProps {
  children: ReactNode;
  /** 约束在包装容器内；false = 自由（仍受视口物理限制） */
  bounds?: 'parent' | false;
  /** 松手后吸附的网格尺寸 [x, y]（px） */
  grid?: [number, number];
  /** 拖拽释放后的惯性；默认开 */
  inertia?: boolean;
  axis?: 'x' | 'y' | 'both';
  className?: string;
  style?: React.CSSProperties;
}

export function Draggable({
  children,
  bounds = 'parent',
  grid,
  inertia = true,
  axis = 'both',
  className,
  style,
}: DraggableProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', minHeight: 48, minWidth: 48, ...style }}
    >
      <motion.div
        drag={axis === 'both' ? true : axis}
        dragConstraints={bounds === 'parent' ? wrapRef : false}
        dragMomentum={inertia}
        style={{
          x,
          y,
          touchAction: 'none',
          display: 'inline-block',
          cursor: 'grab',
        }}
        whileDrag={{ cursor: 'grabbing' }}
        onDragEnd={() => {
          if (grid) {
            x.set(Math.round(x.get() / grid[0]) * grid[0]);
            y.set(Math.round(y.get() / grid[1]) * grid[1]);
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
