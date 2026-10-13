'use client';

/**
 * Lottie 封装：lottie-web 为可选 peer，未安装时渲染占位并告警。
 * reduced-motion 下加载但停在首帧（不自动播放）。
 */

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

export interface LottiePlayerProps {
  /** 动画 JSON 的 URL（lottie-web 的 path 参数） */
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

interface LottieInstance {
  destroy: () => void;
}

export function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  width = 120,
  height = 120,
  className,
  style,
}: LottiePlayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let destroyed = false;
    let instance: LottieInstance | undefined;

    (async () => {
      try {
        const mod = await import('lottie-web');
        if (destroyed || !ref.current) return;
        instance = mod.default.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop: reduced ? false : loop,
          autoplay: reduced ? false : autoplay,
          path: src,
        });
      } catch {
        // lottie-web 未安装（可选 peer）：渲染占位，开发环境提示
        if (process.env.NODE_ENV !== 'production' && ref.current) {
          ref.current.textContent = 'lottie-web 未安装';
        }
      }
    })();

    return () => {
      destroyed = true;
      instance?.destroy();
    };
  }, [src, loop, autoplay, reduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width, height, ...style }}
      role="img"
    />
  );
}
