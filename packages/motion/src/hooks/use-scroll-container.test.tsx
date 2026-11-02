import { describe, expect, it } from 'vitest';
import { findScrollableAncestor } from './use-scroll-container';

/**
 * 滚动容器探测：jsdom 不做布局，scrollHeight / clientHeight 恒为 0，
 * 因此这里用 defineProperty 造出「已溢出」的容器来验证命中逻辑。
 */

function makeBox(
  overflow: string,
  opts: { scroll?: number; client?: number } = {},
): HTMLDivElement {
  const box = document.createElement('div');
  box.style.overflowY = overflow;
  box.style.overflowX = overflow;
  Object.defineProperty(box, 'scrollHeight', { value: opts.scroll ?? 0 });
  Object.defineProperty(box, 'clientHeight', { value: opts.client ?? 0 });
  Object.defineProperty(box, 'scrollWidth', { value: opts.scroll ?? 0 });
  Object.defineProperty(box, 'clientWidth', { value: opts.client ?? 0 });
  return box;
}

describe('findScrollableAncestor', () => {
  it('命中最近的已溢出滚动容器', () => {
    const outer = makeBox('auto', { scroll: 900, client: 300 });
    const inner = makeBox('hidden');
    const target = document.createElement('div');

    outer.appendChild(inner);
    inner.appendChild(target);
    document.body.appendChild(outer);

    expect(findScrollableAncestor(target)).toBe(outer);
    outer.remove();
  });

  it('overflow: hidden 且未溢出时跳过，继续向上找', () => {
    const scrollable = makeBox('scroll', { scroll: 500, client: 200 });
    const plain = makeBox('hidden');
    const target = document.createElement('div');

    scrollable.appendChild(plain);
    plain.appendChild(target);
    document.body.appendChild(scrollable);

    expect(findScrollableAncestor(target)).toBe(scrollable);
    scrollable.remove();
  });

  it('声明了 auto 但内容未溢出时不误判', () => {
    const box = makeBox('auto', { scroll: 200, client: 200 });
    const target = document.createElement('div');
    box.appendChild(target);
    document.body.appendChild(box);

    expect(findScrollableAncestor(target)).toBeNull();
    box.remove();
  });

  it('无外层容器时返回 null（交给页面滚动轴）', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    expect(findScrollableAncestor(target)).toBeNull();
    target.remove();
  });

  it('入参为 null 时安全返回 null', () => {
    expect(findScrollableAncestor(null)).toBeNull();
  });
});
