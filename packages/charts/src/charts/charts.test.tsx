import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LineChart } from './line-chart';
import { BarChart } from './bar-chart';
import { AreaChart } from './area-chart';
import { ComboChart } from './combo-chart';
import { ScatterChart } from './scatter-chart';
import { PieChart } from './pie-chart';

/**
 * jsdom 不做布局，元素尺寸恒为 0，图表因此不会渲染任何图元。
 * 这里伪造一份 640×320 的布局盒，让绘图逻辑真正跑起来。
 */
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

const data = [
  { month: '1月', orders: 120, refunds: 30 },
  { month: '2月', orders: 200, refunds: 40 },
  { month: '3月', orders: 150, refunds: 20 },
];

const series = [
  { key: 'orders', name: '订单量' },
  { key: 'refunds', name: '退款量' },
];

describe('LineChart', () => {
  it('渲染 svg 图元与无障碍描述', () => {
    render(
      <LineChart data={data} xKey="month" series={series} animation={false} />,
    );

    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    // 折线路径存在
    expect(document.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('隐藏的数据表包含真实数值（读屏器可读）', () => {
    render(
      <LineChart data={data} xKey="month" series={series} animation={false} />,
    );

    const table = document.querySelector('table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('订单量');
    expect(table?.textContent).toContain('120');
  });

  it('图例点击可切换系列显隐', () => {
    render(
      <LineChart data={data} xKey="month" series={series} animation={false} />,
    );

    const legendButton = screen.getByTitle('隐藏 订单量');
    fireEvent.click(legendButton);

    expect(screen.getByTitle('显示 订单量').getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  // 边界：空数据展示占位而不抛错
  it('空数据显示空状态', () => {
    render(
      <LineChart data={[]} xKey="month" series={series} emptyText="暂无数据" />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：null 值应断线而不是画到 0
  it('null 值不导致崩溃', () => {
    const withNull = [
      { month: '1月', orders: 120 },
      { month: '2月', orders: null },
      { month: '3月', orders: 150 },
    ];
    render(
      <LineChart
        data={withNull}
        xKey="month"
        series={[{ key: 'orders', name: '订单' }]}
        animation={false}
      />,
    );
    expect(document.querySelector('svg')).not.toBeNull();
  });

  // 异常：数据字段缺失时按缺失处理，不产生 NaN 路径
  it('字段缺失时路径不含 NaN', () => {
    render(
      <LineChart
        data={[{ month: '1月' }, { month: '2月' }]}
        xKey="month"
        series={[{ key: 'orders', name: '订单' }]}
        animation={false}
      />,
    );
    const paths = Array.from(document.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });
});

describe('BarChart', () => {
  it('堆叠模式渲染柱子路径', () => {
    render(
      <BarChart
        data={data}
        xKey="month"
        stack
        animation={false}
        series={[
          { key: 'orders', name: '订单' },
          { key: 'refunds', name: '退款' },
        ]}
      />,
    );
    // 3 个分类 × 2 个系列 = 6 根柱子（堆叠不影响数量，只影响位置）
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(6);
  });
});

describe('PieChart', () => {
  const pieData = [
    { name: 'A', value: 50 },
    { name: 'B', value: 30 },
    { name: 'C', value: 20 },
  ];

  it('每个扇区生成一条路径', () => {
    render(<PieChart data={pieData} animation={false} label={false} />);
    expect(document.querySelectorAll('path').length).toBe(3);
  });

  it('环图中心默认显示总计', () => {
    render(<PieChart data={pieData} animation={false} label={false} />);
    expect(screen.getByText('总计')).toBeTruthy();
  });

  // centerContent 接管中心区域：内置「总计」文本不再渲染，
  // 否则 SVG 内置文本与 HTML 自定义内容会叠在同一个圆心
  it('centerContent 接管中心内容', () => {
    render(
      <PieChart
        data={pieData}
        animation={false}
        label={false}
        centerContent={<div>自定义中心</div>}
      />,
    );
    expect(screen.getByText('自定义中心')).toBeTruthy();
    expect(screen.queryByText('总计')).toBeNull();
  });

  it('总计为 0 时显示空状态', () => {
    render(
      <PieChart
        data={[
          { name: 'A', value: 0 },
          { name: 'B', value: 0 },
        ]}
        emptyText="暂无数据"
      />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：负值数据不应产生反向扇区或 NaN
  it('负值输入不产生 NaN 路径', () => {
    render(
      <PieChart
        data={[
          { name: 'A', value: -10 },
          { name: 'B', value: 20 },
        ]}
        animation={false}
      />,
    );
    const paths = Array.from(document.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });
});

describe('AreaChart / ComboChart', () => {
  it('面积图生成带填充的路径', () => {
    render(
      <AreaChart
        data={data}
        xKey="month"
        series={[{ key: 'orders', name: '订单' }]}
        animation={false}
      />,
    );

    const filled = Array.from(document.querySelectorAll('path')).filter(
      (node) => (node.getAttribute('fill') ?? 'none') !== 'none',
    );
    expect(filled.length).toBeGreaterThan(0);
  });

  it('组合图同时渲染柱与线', () => {
    render(
      <ComboChart
        animation={false}
        data={data}
        xKey="month"
        series={[
          { key: 'orders', name: '订单', type: 'bar' },
          { key: 'refunds', name: '退款', type: 'line' },
        ]}
      />,
    );
    // 柱（3 × 1）+ 线（1 条）+ 面积/符号，取保守下界
    expect(document.querySelectorAll('path').length).toBeGreaterThanOrEqual(4);
  });
});

describe('ScatterChart', () => {
  it('按数值 x 轴绘制散点', () => {
    render(
      <ScatterChart
        animation={false}
        data={[
          { x: 10, y: 20 },
          { x: 30, y: 40 },
          { x: 50, y: 25 },
        ]}
        xKey="x"
        series={[{ key: 'y', name: '样本' }]}
      />,
    );
    expect(document.querySelectorAll('path').length).toBeGreaterThanOrEqual(3);
  });

  // 边界：空数据展示占位
  it('空数据显示空状态', () => {
    render(
      <ScatterChart
        data={[]}
        xKey="x"
        series={[{ key: 'y' }]}
        emptyText="暂无数据"
      />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });
});

describe('渲染器与交互', () => {
  it('renderer="canvas" 时输出 canvas 元素', () => {
    // jsdom 无 canvas 实现，显式返回 null 以静默 "Not implemented" 提示
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(
      <LineChart
        renderer="canvas"
        data={data}
        xKey="month"
        series={series}
        animation={false}
      />,
    );
    expect(document.querySelector('canvas')).not.toBeNull();
  });

  it('指针移动时出现 tooltip 并显示数值', () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} animation={false} />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;

    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 120,
      }),
    );

    const tooltip = container.querySelector('.aura-chart__tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain('订单量');
  });

  // 边界：移出绘图区应清除 tooltip
  it('指针移出后 tooltip 消失', () => {
    const { container } = render(
      <LineChart data={data} xKey="month" series={series} animation={false} />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;

    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 120,
      }),
    );
    // React 的 onPointerLeave 由 pointerout 合成，relatedTarget 在元素外部时触发
    fireEvent(
      plot,
      new MouseEvent('pointerout', {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );

    expect(container.querySelector('.aura-chart__tooltip')).toBeNull();
  });
});

describe('Tooltip 配置', () => {
  const hover = (container: HTMLElement) => {
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 120,
      }),
    );
  };

  it('tooltip={false} 时不渲染悬浮提示', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        series={series}
        animation={false}
        tooltip={false}
      />,
    );
    hover(container);
    expect(container.querySelector('.aura-chart__tooltip')).toBeNull();
  });

  it('tooltip.show=false 时不渲染悬浮提示', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        series={series}
        animation={false}
        tooltip={{ show: false }}
      />,
    );
    hover(container);
    expect(container.querySelector('.aura-chart__tooltip')).toBeNull();
  });

  it('自定义 formatter 替换默认内容', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        series={series}
        animation={false}
        tooltip={{
          formatter: (payload) => `共 ${payload.series.length} 个系列`,
        }}
      />,
    );
    hover(container);
    expect(
      container.querySelector('.aura-chart__tooltip')?.textContent,
    ).toContain('共 2 个系列');
  });

  // 边界：formatter 返回 null 表示「这一次不显示」
  it('formatter 返回 null 时隐藏提示', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="month"
        series={series}
        animation={false}
        tooltip={{ formatter: () => null }}
      />,
    );
    hover(container);
    expect(container.querySelector('.aura-chart__tooltip')).toBeNull();
  });
});
