import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * reduced-motion 分支单独成文件：motion 的 useReducedMotion 在模块级缓存
 * 首次 matchMedia 结果，必须在本文件首次读取之前把环境设为「减少动效」。
 * （vitest 按文件隔离模块图，因此这里设置的缓存不会影响其他测试文件。）
 */

const destroy = vi.fn();
const loadAnimation = vi.fn(() => ({ destroy }));

vi.mock('lottie-web', () => ({ default: { loadAnimation } }));

// 在导入组件之前设置：所有 prefers-reduced-motion 查询都返回 true
window.matchMedia = ((query: string) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia;

const { LottiePlayer } = await import('./lottie-player');

describe('LottiePlayer · reduced-motion', () => {
  it('强制 loop=false、autoplay=false（停在首帧）', async () => {
    render(<LottiePlayer src="https://cdn.example.com/c.json" />);
    await waitFor(() => expect(loadAnimation).toHaveBeenCalled());
    expect(loadAnimation).toHaveBeenCalledWith(
      expect.objectContaining({ loop: false, autoplay: false }),
    );
  });
});
