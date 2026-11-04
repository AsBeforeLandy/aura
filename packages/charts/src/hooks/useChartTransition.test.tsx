import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor, screen, act } from '@testing-library/react';
import { useChartTransition } from './useChartTransition';
import { resolveAnimation } from '../core/animation';

interface ProbeProps {
  matrix: (number | null)[][];
  animation?: boolean | { duration?: number; stagger?: number };
}

/** 探针组件：把 hook 的输出序列化到 DOM，便于断言 */
function Probe({ matrix, animation = true }: ProbeProps) {
  const { values, progress } = useChartTransition(
    matrix,
    resolveAnimation(animation),
  );
  return <div data-testid="out">{JSON.stringify({ values, progress })}</div>;
}

function read() {
  const raw = screen.getByTestId('out').textContent ?? '{}';
  return JSON.parse(raw) as { values: (number | null)[][]; progress: number };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useChartTransition', () => {
  it('关闭动画时直接呈现终态', () => {
    render(<Probe matrix={[[1, 2]]} animation={false} />);
    const state = read();
    expect(state.progress).toBe(1);
    expect(state.values).toEqual([[1, 2]]);
  });

  // 入场：进度从 0 推进到 1，数值保持目标值（生长交给 scene 处理）
  it('入场阶段推进进度并保留目标值', async () => {
    render(<Probe matrix={[[10, 20]]} animation={{ duration: 80 }} />);

    expect(read().progress).toBeLessThan(1);

    await waitFor(() => expect(read().progress).toBeCloseTo(1, 3), {
      timeout: 1500,
    });
    expect(read().values).toEqual([[10, 20]]);
  });

  // 关键回归：数据更新不能重播入场
  it('数据更新时进度保持为 1，改为值插值', async () => {
    const { rerender } = render(
      <Probe matrix={[[10]]} animation={{ duration: 60 }} />,
    );
    await waitFor(() => expect(read().progress).toBeCloseTo(1, 3), {
      timeout: 1500,
    });

    await act(async () => {
      rerender(<Probe matrix={[[90]]} animation={{ duration: 60 }} />);
    });

    // 进度没有被重置（不会回到 0 重播入场）
    expect(read().progress).toBeGreaterThan(0.99);

    // 数值从旧值平滑靠近新值，最终收敛
    await waitFor(() => expect(read().values[0][0]).toBeCloseTo(90, 1), {
      timeout: 1500,
    });
  });

  // 边界：null 与数值之间不做插值，缺失就是缺失
  it('null 值不参与插值', async () => {
    const { rerender } = render(
      <Probe matrix={[[5, null]]} animation={{ duration: 60 }} />,
    );
    await waitFor(() => expect(read().progress).toBeCloseTo(1, 3), {
      timeout: 1500,
    });

    await act(async () => {
      rerender(<Probe matrix={[[5, null]]} animation={{ duration: 60 }} />);
    });

    expect(read().values[0][1]).toBeNull();
  });

  // 边界：时长为 0 等价于关闭动画
  it('duration 为 0 时直接到位', () => {
    render(<Probe matrix={[[3, 4]]} animation={{ duration: 0 }} />);
    expect(read().progress).toBe(1);
    expect(read().values).toEqual([[3, 4]]);
  });

  // 边界：从缺失值过渡到有值时，直接取目标值
  it('null 到数值的过渡直接采用目标值', async () => {
    const { rerender } = render(
      <Probe matrix={[[null]]} animation={{ duration: 60 }} />,
    );
    await waitFor(() => expect(read().progress).toBeCloseTo(1, 3), {
      timeout: 1500,
    });

    await act(async () => {
      rerender(<Probe matrix={[[42]]} animation={{ duration: 60 }} />);
    });

    await waitFor(() => expect(read().values[0][0]).toBeGreaterThan(0), {
      timeout: 1500,
    });
  });

  // 无障碍：系统偏好减少动效时跳过动画
  it('prefers-reduced-motion 时立即到位', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    render(<Probe matrix={[[7, 8]]} animation={{ duration: 2000 }} />);
    expect(read().progress).toBe(1);
    expect(read().values).toEqual([[7, 8]]);
  });
});
