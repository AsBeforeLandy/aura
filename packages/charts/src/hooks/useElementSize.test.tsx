import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useElementSize } from './useElementSize';

function Probe() {
  const { ref, size, measure } = useElementSize<HTMLDivElement>();
  return (
    <div>
      <div ref={ref} data-testid="box" />
      <span data-testid="size">{`${size.width}x${size.height}`}</span>
      <button type="button" onClick={measure}>
        重新测量
      </button>
    </div>
  );
}

const RECT = {
  width: 320,
  height: 180,
  top: 0,
  left: 0,
  right: 320,
  bottom: 180,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useElementSize', () => {
  it('挂载后测量元素尺寸', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      RECT,
    );
    render(<Probe />);
    expect(screen.getByTestId('size').textContent).toBe('320x180');
  });

  // 边界：尺寸未变化时不触发额外渲染（用「相同尺寸再测一次」验证不抛错且值稳定）
  it('尺寸不变时保持稳定', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      RECT,
    );
    render(<Probe />);
    act(() => {
      screen.getByText('重新测量').click();
    });
    expect(screen.getByTestId('size').textContent).toBe('320x180');
  });

  // 边界：尺寸变化后重新测量能拿到新值
  it('尺寸变化后更新', () => {
    const spy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(RECT);
    render(<Probe />);

    spy.mockReturnValue({ ...RECT, width: 500, height: 240 } as DOMRect);
    act(() => {
      screen.getByText('重新测量').click();
    });

    expect(screen.getByTestId('size').textContent).toBe('500x240');
  });

  // 异常：环境没有 ResizeObserver 时退化为 resize 监听
  it('无 ResizeObserver 时监听 window.resize', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      RECT,
    );
    const original = window.ResizeObserver;
    // @ts-expect-error 故意移除以覆盖降级分支
    delete window.ResizeObserver;

    render(<Probe />);
    expect(screen.getByTestId('size').textContent).toBe('320x180');

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('size').textContent).toBe('320x180');

    window.ResizeObserver = original;
  });
});
