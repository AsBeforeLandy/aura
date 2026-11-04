import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Chart } from './chart';

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

describe('Chart（option 配置式）', () => {
  it('折线 option 渲染为折线图', () => {
    render(
      <Chart
        animation={false}
        option={{
          xAxis: { data: ['一月', '二月', '三月'] },
          series: [{ type: 'line', name: '销量', data: [120, 200, 150] }],
        }}
      />,
    );

    expect(document.querySelector('svg')).not.toBeNull();
    expect(document.querySelector('table')?.textContent).toContain('销量');
    expect(document.querySelector('table')?.textContent).toContain('200');
  });

  it('柱状 option 渲染为柱状图', () => {
    render(
      <Chart
        animation={false}
        option={{
          xAxis: { data: ['A', 'B'] },
          series: [{ type: 'bar', name: '数量', data: [10, 20] }],
        }}
      />,
    );
    expect(document.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });

  it('饼图 option 走 PieChart 分支', () => {
    render(
      <Chart
        animation={false}
        option={{
          xAxis: { data: ['直接', '搜索'] },
          series: [{ type: 'pie', name: '来源', data: [60, 40] }],
        }}
      />,
    );
    expect(document.querySelector('[data-aura-chart="pie"]')).not.toBeNull();
  });

  // 混合类型应落到 ComboChart，而不是被强行统一成某一种
  it('混合系列类型走组合图', () => {
    render(
      <Chart
        animation={false}
        option={{
          xAxis: { data: ['1月', '2月'] },
          series: [
            { type: 'bar', name: '营收', data: [10, 20] },
            { type: 'line', name: '增速', data: [5, 8] },
          ],
        }}
      />,
    );
    expect(
      document.querySelector('[data-aura-chart="cartesian"]'),
    ).not.toBeNull();
  });

  it('title 渲染标题与副标题', () => {
    render(
      <Chart
        animation={false}
        option={{
          title: { text: '月度报表', subtext: '数据来源：内部' },
          xAxis: { data: ['A'] },
          series: [{ type: 'line', name: 'S', data: [1] }],
        }}
      />,
    );
    expect(screen.getByText('月度报表')).toBeTruthy();
    expect(screen.getByText('数据来源：内部')).toBeTruthy();
  });

  // 异常：空 option 不应崩溃
  it('空 option 安全降级', () => {
    expect(() => render(<Chart option={{}} />)).not.toThrow();
  });

  // 边界：legend: false 时不渲染图例
  it('legend.show 为 false 时不渲染图例', () => {
    render(
      <Chart
        animation={false}
        option={{
          legend: { show: false },
          xAxis: { data: ['A'] },
          series: [{ type: 'line', name: 'S', data: [1] }],
        }}
      />,
    );
    expect(screen.queryByRole('group', { name: '图例' })).toBeNull();
  });
});
