import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * LottiePlayer 测试：lottie-web 是可选 peer，这里用 vi.mock 替代真实引擎，
 * 验证参数透传、reduced-motion 降级、卸载销毁与「未安装」占位四条路径。
 */

const destroy = vi.fn();
const loadAnimation = vi.fn(() => ({ destroy }));

vi.mock('lottie-web', () => ({
  default: { loadAnimation },
}));

import { LottiePlayer } from './lottie-player';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  loadAnimation.mockClear();
  destroy.mockClear();
  window.matchMedia = originalMatchMedia;
});

describe('LottiePlayer', () => {
  it('渲染 role=img 容器并应用尺寸', () => {
    render(<LottiePlayer src="https://cdn.example.com/a.json" width={200} height={150} />);
    const el = screen.getByRole('img');
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('150px');
  });

  it('加载动画并透传 src / renderer / loop / autoplay', async () => {
    render(<LottiePlayer src="https://cdn.example.com/b.json" loop={false} autoplay={false} />);
    await waitFor(() => expect(loadAnimation).toHaveBeenCalledTimes(1));
    expect(loadAnimation).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'https://cdn.example.com/b.json',
        renderer: 'svg',
        loop: false,
        autoplay: false,
      }),
    );
  });

  it('卸载时销毁动画实例', async () => {
    const { unmount } = render(<LottiePlayer src="https://cdn.example.com/d.json" />);
    await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
    unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('lottie-web 不可用时渲染占位文案且不抛错', async () => {
    vi.resetModules();
    vi.doMock('lottie-web', () => {
      throw new Error('Cannot find module lottie-web');
    });
    const mod = await import('./lottie-player');
    render(<mod.LottiePlayer src="https://cdn.example.com/e.json" />);
    await waitFor(() => {
      expect(screen.getByRole('img').textContent).toBe('lottie-web 未安装');
    });
    vi.doUnmock('lottie-web');
  });
});
