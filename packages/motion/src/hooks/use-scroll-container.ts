'use client';

/**
 * 滚动容器解析：`useScroll` 默认监听 window 的滚动，若目标位于**内层滚动容器**
 * （抽屉、表格、dumi 的 demo 预览框等）里，进度不会随容器滚动更新。
 *
 * `useScrollContainer` 会优先用显式传入的 `container`，否则向上查找最近的可滚动
 * 祖先；都没有则返回 `undefined`（交给引擎用页面滚动轴）。
 */

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * 向上查找最近的可滚动祖先（自身不参与判断）。
 * 判据：`overflow-y/x` 为 auto|scroll|overlay **且** 该方向确实溢出——
 * 只判 overflow 会把 dumi 的 `.markdown` 之类"声明了 auto 但未溢出"的容器误命中。
 */
export function findScrollableAncestor(
  el: HTMLElement | null,
): HTMLElement | null {
  if (!el || typeof window === 'undefined') return null;
  let node = el.parentElement;

  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    // 部分环境（含 jsdom）不会把 overflow 简写展开到 overflowY/X，故做兜底
    const overflowY = style.overflowY || style.overflow || '';
    const overflowX = style.overflowX || style.overflow || '';
    const scrollableY = /(auto|scroll|overlay)/.test(overflowY);
    const scrollableX = /(auto|scroll|overlay)/.test(overflowX);

    // +1 容差：缩放 / 小数像素会让 scrollHeight 与 clientHeight 相差 1px
    if (scrollableY && node.scrollHeight > node.clientHeight + 1) return node;
    if (scrollableX && node.scrollWidth > node.clientWidth + 1) return node;

    node = node.parentElement;
  }

  return null;
}

/**
 * 解析出应绑定的滚动容器 ref。
 *
 * @param hostRef   目标元素的 ref
 * @param container 显式指定的滚动容器（优先级高于自动探测）
 * @returns 滚动容器的 ref；`undefined` 表示使用页面滚动轴
 */
export function useScrollContainer(
  hostRef: RefObject<HTMLElement | null>,
  container?: RefObject<HTMLElement | null>,
): RefObject<HTMLElement | null> | undefined {
  // undefined 表示"尚未探测"，null 表示"确实是页面滚动"
  const [resolved, setResolved] = useState<
    RefObject<HTMLElement | null> | null | undefined
  >(container);

  useIsomorphicLayoutEffect(() => {
    if (container) {
      setResolved(container);
      return;
    }
    const found = findScrollableAncestor(hostRef.current);
    setResolved(found ? { current: found } : null);
  }, [container, hostRef]);

  return resolved ?? undefined;
}
