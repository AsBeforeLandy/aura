import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { LineChart } from './line-chart';

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

const series = [{ key: 'v', name: '数值' }];

describe('无障碍数据表', () => {
  it('被包裹在隐藏容器里，而不是直接放在文档流中', () => {
    const data = [
      { x: '1', v: 10 },
      { x: '2', v: 20 },
    ];
    const { container } = render(
      <LineChart data={data} xKey="x" series={series} animation={false} />,
    );

    const wrapper = container.querySelector('.aura-chart__a11y');
    expect(wrapper).not.toBeNull();
    // 关键：table 必须是 wrapper 的子元素
    expect(wrapper?.querySelector('table')).not.toBeNull();
    // 且 table 不能直接挂在图表根节点下（那会把滚动高度撑开）
    expect(container.querySelector('.aura-chart > table')).toBeNull();
  });

  it('表格内容与图表数据一致', () => {
    const data = [
      { x: '1月', v: 120 },
      { x: '2月', v: 200 },
    ];
    const { container } = render(
      <LineChart data={data} xKey="x" series={series} animation={false} />,
    );
    const table = container.querySelector('.aura-chart__a11y-table');
    expect(table?.textContent).toContain('1月');
    expect(table?.textContent).toContain('200');
  });

  // 回归：8000 行曾把页面滚动高度撑到 21 万像素，滚到底全是空白
  it('数据量很大时行数被限制', () => {
    const data = Array.from({ length: 3000 }, (_, index) => ({
      x: `${index}`,
      v: index,
    }));

    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        sampling={false}
        animation={false}
        renderer="svg"
      />,
    );

    const rows = container.querySelectorAll('.aura-chart__a11y-table tbody tr');
    // 200 行数据 + 1 行「其余省略」说明
    expect(rows.length).toBeLessThanOrEqual(201);
    expect(
      container.querySelector('.aura-chart__a11y-table')?.textContent,
    ).toContain('未列出');
  });

  // 采样后表格只呈现图上真正画出来的点
  it('采样后表格行数跟随采样结果', () => {
    const data = Array.from({ length: 3000 }, (_, index) => ({
      x: `${index}`,
      v: Math.sin(index / 30) * 50,
    }));

    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        sampling={100}
        animation={false}
      />,
    );

    const rows = container.querySelectorAll('.aura-chart__a11y-table tbody tr');
    expect(rows.length).toBe(100);
  });

  it('隐藏系列的列不出现在表格里', () => {
    const data = [{ x: '1', a: 10, b: 20 }];
    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        animation={false}
        series={[
          { key: 'a', name: '甲' },
          { key: 'b', name: '乙', hidden: true },
        ]}
      />,
    );
    const header =
      container.querySelector('.aura-chart__a11y-table thead')?.textContent ??
      '';
    expect(header).toContain('甲');
    expect(header).not.toContain('乙');
  });
});
