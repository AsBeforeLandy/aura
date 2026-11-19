import { useEffect, useState } from 'react';

/**
 * 全局主题版本号：<html> 的 data-mode / data-palette / data-theme 任一
 * 变化时递增（旧的 data-theme 继续监听以兼容历史用法）。
 *
 * 3D 组件把它放进 useMemo / 依赖数组，切换色板或明暗后即可重读
 * --aura-* 令牌 —— 与 charts 包 useChartTheme 的订阅策略一致。
 */
export function useThemeVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (
      typeof MutationObserver === 'undefined' ||
      typeof document === 'undefined'
    ) {
      return undefined;
    }
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'data-palette', 'data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return version;
}

/** 读取 --aura-* 设计令牌（:root 级），缺失或 SSR 时回退 */
export function readTokenColor(token: string, fallback: string): string {
  if (
    typeof getComputedStyle !== 'function' ||
    typeof document === 'undefined'
  ) {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallback;
}
