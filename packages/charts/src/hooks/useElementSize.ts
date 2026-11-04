import { useCallback, useEffect, useRef, useState } from 'react';

export interface Size {
  width: number;
  height: number;
}

/**
 * 监听元素尺寸。
 *
 * 图表必须能跟随容器变化（响应式栅格里容器宽度是被父元素决定的），
 * 因此不用 window.resize（弹窗/抽屉里不会触发），而用 ResizeObserver。
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setSize((prev) => {
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      // 尺寸未变时不触发渲染，避免 ResizeObserver 抖动导致的重绘风暴
      return prev.width === next.width && prev.height === next.height
        ? prev
        : next;
    });
  }, []);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined') {
      // jsdom 等环境没有 ResizeObserver，退化为一次性测量
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
      }
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [measure]);

  return { ref, size, measure };
}
