import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeatmapChart } from './heatmap-chart';
import { CandlestickChart } from './candlestick-chart';
import { ComboChart } from './combo-chart';

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

describe('HeatmapChart', () => {
  const data = [
    { x: 'A', y: '甲', value: 10 },
    { x: 'B', y: '甲', value: 20 },
    { x: 'A', y: '乙', value: 30 },
    { x: 'B', y: '乙', value: null },
  ];

  it('为每个有值的格子渲染一个色块', () => {
    const { container } = render(
      <HeatmapChart
        data={data}
        xLabels={['A', 'B']}
        yLabels={['甲', '乙']}
        animation={false}
      />,
    );
    // 有值格用圆角路径，缺失格用矩形占位
    expect(container.querySelectorAll('path')).toHaveLength(3);
    expect(container.querySelectorAll('rect')).toHaveLength(1);
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
  });

  it('显示行列标签', () => {
    const { container } = render(
      <HeatmapChart
        data={data}
        xLabels={['A', 'B']}
        yLabels={['甲', '乙']}
        animation={false}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent,
    );
    expect(texts).toContain('甲');
    expect(texts).toContain('乙');
    expect(texts).toContain('A');
  });

  // 边界：格子够大时显示数值
  it('showValue 为 true 时格内标数值', () => {
    const { container } = render(
      <HeatmapChart
        data={data}
        xLabels={['A', 'B']}
        yLabels={['甲', '乙']}
        showValue
        animation={false}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent,
    );
    expect(texts).toContain('30');
  });

  // 边界：缺失值与 0 要能区分（缺失不参与色阶）
  it('null 值渲染为空心格且不参与色阶', () => {
    const { container } = render(
      <HeatmapChart
        data={data}
        xLabels={['A', 'B']}
        yLabels={['甲', '乙']}
        showValue
        animation={false}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent,
    );
    expect(texts).not.toContain('0');
  });

  it('空数据显示占位', () => {
    render(<HeatmapChart data={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 异常：全等值不应产生 NaN 颜色
  it('全部数值相同时颜色仍合法', () => {
    const flat = [
      { x: 'A', y: '甲', value: 5 },
      { x: 'B', y: '甲', value: 5 },
    ];
    const { container } = render(
      <HeatmapChart
        data={flat}
        xLabels={['A', 'B']}
        yLabels={['甲']}
        animation={false}
      />,
    );
    const fills = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('fill') ?? '',
    );
    fills.forEach((fill) => expect(fill).not.toContain('NaN'));
  });

  it('悬浮时显示 tooltip', () => {
    const { container } = render(
      <HeatmapChart
        data={data}
        xLabels={['A', 'B']}
        yLabels={['甲', '乙']}
        animation={false}
      />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 200,
        clientY: 120,
      }),
    );
    expect(
      container.querySelector('.aura-chart__tooltip')?.textContent,
    ).toContain('甲');
  });
});

describe('CandlestickChart', () => {
  const data = [
    { date: 'D1', open: 10, high: 13, low: 9, close: 12, volume: 1000 },
    { date: 'D2', open: 12, high: 14, low: 8, close: 9, volume: 1800 },
    { date: 'D3', open: 9, high: 15, low: 9, close: 14, volume: 2400 },
  ];

  it('每根蜡烛由影线与实体组成', () => {
    const { container } = render(
      <CandlestickChart
        data={data}
        animation={false}
        showVolume={false}
        ma={[]}
      />,
    );
    // 3 根影线 + 3 个实体（均线关闭、成交量关闭）
    expect(container.querySelectorAll('line').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll('rect')).toHaveLength(3);
  });

  it('上涨用红、下跌用绿（国内习惯）', () => {
    const { container } = render(
      <CandlestickChart
        data={data}
        animation={false}
        showVolume={false}
        ma={[]}
      />,
    );
    const fills = Array.from(container.querySelectorAll('rect')).map((node) =>
      node.getAttribute('fill'),
    );
    // D1 收 12 > 开 10 上涨；D2 收 9 < 开 12 下跌
    expect(fills).toContain('#ef4444');
    expect(fills).toContain('#22c55e');
  });

  it('开启成交量后为每根蜡烛追加量柱', () => {
    const { container } = render(
      <CandlestickChart data={data} animation={false} showVolume ma={[]} />,
    );
    expect(container.querySelectorAll('rect')).toHaveLength(6);
  });

  it('均线按周期绘制，不足周期不画', () => {
    const { container } = render(
      <CandlestickChart
        data={data}
        animation={false}
        showVolume={false}
        ma={[2]}
      />,
    );
    // MA2 在 3 个点里有 2 个有效点，应生成一条路径
    const paths = Array.from(container.querySelectorAll('path'));
    expect(paths.length).toBeGreaterThanOrEqual(1);
    paths.forEach((node) =>
      expect(node.getAttribute('d') ?? '').not.toContain('NaN'),
    );
  });

  it('空数据显示占位', () => {
    render(<CandlestickChart data={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 异常：开等于收时实体高度至少 1px，不能消失
  it('开盘等于收盘时仍有可见实体', () => {
    const flat = [{ date: 'D1', open: 10, high: 12, low: 8, close: 10 }];
    const { container } = render(
      <CandlestickChart
        data={flat}
        animation={false}
        showVolume={false}
        ma={[]}
      />,
    );
    const rect = container.querySelector('rect');
    expect(Number(rect?.getAttribute('height'))).toBeGreaterThanOrEqual(1);
  });
});

describe('双 y 轴', () => {
  const data = [
    { month: '1月', revenue: 320, rate: 12 },
    { month: '2月', revenue: 280, rate: 18 },
    { month: '3月', revenue: 410, rate: 25 },
  ];

  it('开启 yAxisRight 后渲染第二根轴与独立刻度', () => {
    const { container } = render(
      <ComboChart
        data={data}
        xKey="month"
        animation={false}
        yAxisRight={{ formatter: (value) => `${value}%` }}
        series={[
          { key: 'revenue', name: '营收', type: 'bar' },
          { key: 'rate', name: '增长率', type: 'line', yAxisIndex: 1 },
        ]}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    const percentLabels = texts.filter((text) => text.endsWith('%'));
    expect(percentLabels.length).toBeGreaterThanOrEqual(2);
  });

  // 边界：只传配置但没有系列使用右轴，不应画出空轴
  it('无系列使用右轴时不渲染第二根轴', () => {
    const { container } = render(
      <ComboChart
        data={data}
        xKey="month"
        animation={false}
        yAxisRight
        series={[
          { key: 'revenue', name: '营收', type: 'bar' },
          { key: 'rate', name: '增长率', type: 'line' },
        ]}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    expect(texts.filter((text) => text.endsWith('%'))).toHaveLength(0);
  });
});

describe('P2 边界与交互', () => {
  it('K 线数据没有 volume 时不画成交量副图', () => {
    const noVolume = [
      { date: 'D1', open: 10, high: 13, low: 9, close: 12 },
      { date: 'D2', open: 12, high: 14, low: 8, close: 9 },
    ];
    const { container } = render(
      <CandlestickChart data={noVolume} animation={false} showVolume ma={[]} />,
    );
    // 只有实体，没有量柱
    expect(container.querySelectorAll('rect')).toHaveLength(2);
  });

  it('K 线悬浮显示开高低收', () => {
    const data = [
      { date: 'D1', open: 10, high: 13, low: 9, close: 12, volume: 900 },
      { date: 'D2', open: 12, high: 14, low: 8, close: 9, volume: 1200 },
    ];
    const { container } = render(
      <CandlestickChart
        data={data}
        animation={false}
        showVolume={false}
        ma={[]}
      />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 200,
        clientY: 100,
      }),
    );

    const tooltip = container.querySelector('.aura-chart__tooltip');
    expect(tooltip?.textContent).toContain('开盘');
    expect(tooltip?.textContent).toContain('收盘');
  });

  // 边界：格子间隙为 0 时不应出现负尺寸
  it('cellGap 为 0 时仍能渲染', () => {
    const { container } = render(
      <HeatmapChart
        data={[
          { x: 'A', y: '甲', value: 1 },
          { x: 'B', y: '甲', value: 2 },
        ]}
        xLabels={['A', 'B']}
        yLabels={['甲']}
        cellGap={0}
        cellRadius={0}
        animation={false}
      />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });

  // 边界：显式标签多于数据时，多出的格按缺失处理
  it('标签多于数据时不报错', () => {
    const { container } = render(
      <HeatmapChart
        data={[{ x: 'A', y: '甲', value: 1 }]}
        xLabels={['A', 'B', 'C']}
        yLabels={['甲', '乙']}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('rect').length).toBeGreaterThanOrEqual(5);
  });
});
