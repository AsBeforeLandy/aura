import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BarChart } from './bar-chart';

const RECT = {
  width: 640,
  height: 320,
  top: 0,
  left: 0,
  right: 640,
  bottom: 320,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    RECT,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

const stackData = [
  { x: '华东', online: 40, store: 30, other: 10 },
  { x: '华南', online: 30, store: 25, other: 8 },
];

const stackSeries = [
  { key: 'online', name: '线上' },
  { key: 'store', name: '门店' },
  { key: 'other', name: '其他' },
];

/** path 里出现 A 命令说明有圆角弧线 */
const hasArc = (d: string | null) => /\dA|A\d/.test(d ?? '');

describe('堆叠柱圆角', () => {
  // 渲染顺序是「按系列、系列内按 x」，所以前两个 path 是底部系列的两个柱子
  it('只有最顶段有圆角，中间与底部段是直角', () => {
    const { container } = render(
      <BarChart
        data={stackData}
        xKey="x"
        series={stackSeries}
        stack
        animation={false}
      />,
    );

    const paths = Array.from(container.querySelectorAll('path')).map((node) =>
      node.getAttribute('d'),
    );
    // 6 根柱子：online×2、store×2、other×2
    expect(paths).toHaveLength(6);

    const bottom = paths.slice(0, 2); // online（贴基线）
    const middle = paths.slice(2, 4); // store（中间段）
    const top = paths.slice(4, 6); // other（最远端）

    bottom.forEach((d) => expect(hasArc(d)).toBe(false));
    middle.forEach((d) => expect(hasArc(d)).toBe(false));
    top.forEach((d) => expect(hasArc(d)).toBe(true));
  });

  // 非堆叠柱：每根都是独立的，两端自由，仍保留圆角
  it('非堆叠柱保留圆角', () => {
    const { container } = render(
      <BarChart
        data={[{ x: 'A', v: 10 }]}
        xKey="x"
        series={[{ key: 'v', name: '数值' }]}
        animation={false}
      />,
    );
    const d = container.querySelector('path')?.getAttribute('d');
    expect(hasArc(d)).toBe(true);
  });

  // 负值堆叠：最远端是向下，圆角应加在底部
  it('负值堆叠的圆角加在最下面一段', () => {
    const negative = [{ x: 'A', a: -10, b: -20 }];
    const { container } = render(
      <BarChart
        data={negative}
        xKey="x"
        series={[
          { key: 'a', name: '甲' },
          { key: 'b', name: '乙' },
        ]}
        stack
        animation={false}
      />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map((node) =>
      node.getAttribute('d'),
    );
    expect(hasArc(paths[0])).toBe(false);
    expect(hasArc(paths[1])).toBe(true);
  });
});

describe('tooltip 边界', () => {
  it('靠近顶部时翻到锚点下方，避免被容器裁掉', () => {
    // 数据点很高，y 会接近容器顶部
    const data = [{ x: 'A', v: 1000 }];
    const { container } = render(
      <BarChart
        data={data}
        xKey="x"
        series={[{ key: 'v', name: '数值' }]}
        animation={false}
        height={320}
      />,
    );

    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 40,
      }),
    );

    const tooltip = container.querySelector(
      '.aura-chart__tooltip',
    ) as HTMLElement | null;
    expect(tooltip).not.toBeNull();
    // 翻到下方时用 translate(-50%, 0)，不再向上偏移
    expect(tooltip?.style.transform).toContain('translate(-50%, 0)');
  });

  it('空间充足时仍然浮在上方', () => {
    // 用两极值把值域拉开，让 v=10 的柱子贴近底部，上方留出空间
    const data = [
      { x: 'A', v: 10 },
      { x: 'B', v: 1000 },
    ];
    const { container } = render(
      <BarChart
        data={data}
        xKey="x"
        series={[{ key: 'v', name: '数值' }]}
        animation={false}
      />,
    );

    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    // 靠近底部，上方空间充足
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 300,
      }),
    );

    const tooltip = container.querySelector(
      '.aura-chart__tooltip',
    ) as HTMLElement | null;
    expect(tooltip?.style.transform).toContain('-100%');
  });
});
