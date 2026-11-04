import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadarChart } from './radar-chart';
import { GaugeChart } from './gauge-chart';
import { FunnelChart } from './funnel-chart';
import { RingProgress } from './ring-progress';
import { WaterfallChart } from './waterfall-chart';
import { Sparkline } from './sparkline';

/** jsdom 不做布局，伪造一份 640×320 的盒子让尺寸相关逻辑真正跑起来 */
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

const indicators = [
  { name: '性能', max: 100 },
  { name: '易用性', max: 100 },
  { name: '生态', max: 100 },
  { name: '文档', max: 100 },
];

describe('RadarChart', () => {
  it('为每个系列绘制一个多边形', () => {
    const { container } = render(
      <RadarChart
        animation={false}
        indicators={indicators}
        series={[
          { key: 'a', name: 'A', values: [80, 90, 70, 85] },
          { key: 'b', name: 'B', values: [60, 70, 95, 80] },
        ]}
      />,
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
  });

  // 边界：指标少于 3 个时无法构成多边形，应走空状态
  it('指标不足 3 个时展示空状态', () => {
    render(
      <RadarChart
        indicators={indicators.slice(0, 2)}
        series={[{ key: 'a', name: 'A', values: [80, 90] }]}
        emptyText="暂无数据"
      />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：数值超出指标上限时被夹紧，不产生越界路径
  it('超出上限的数值不产生 NaN', () => {
    const { container } = render(
      <RadarChart
        animation={false}
        indicators={indicators}
        series={[{ key: 'a', name: 'A', values: [300, 90, 70, 85] }]}
      />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });

  it('图例点击可隐藏系列', () => {
    render(
      <RadarChart
        animation={false}
        indicators={indicators}
        series={[
          { key: 'a', name: '系列 A', values: [80, 90, 70, 85] },
          { key: 'b', name: '系列 B', values: [60, 70, 95, 80] },
        ]}
      />,
    );
    fireEvent.click(screen.getByTitle('隐藏 系列 A'));
    expect(screen.getByTitle('显示 系列 A').getAttribute('aria-pressed')).toBe(
      'false',
    );
  });
});

describe('GaugeChart', () => {
  it('渲染轨道、进度弧与中心数值', () => {
    const { container } = render(
      <GaugeChart value={72} unit="%" label="完成度" animation={false} />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain('72%');
    expect(container.textContent).toContain('完成度');
  });

  it('分段配色按数值落入的区间取色', () => {
    const { container } = render(
      <GaugeChart
        value={320}
        min={0}
        max={1000}
        animation={false}
        ranges={[
          { to: 400, color: '#ef4444' },
          { to: 700, color: '#f59e0b' },
          { to: 1000, color: '#10b981' },
        ]}
      />,
    );
    const arcs = Array.from(container.querySelectorAll('path')).map((node) =>
      node.getAttribute('stroke'),
    );
    expect(arcs).toContain('#ef4444');
  });

  // 边界：超出量程时夹紧到端点
  it('数值超出量程不产生越界路径', () => {
    const { container } = render(
      <GaugeChart value={999} max={100} animation={false} />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });

  // 异常：量程退化为 0 长度时不能除零
  it('min === max 时不崩溃', () => {
    expect(() =>
      render(<GaugeChart value={5} min={5} max={5} animation={false} />),
    ).not.toThrow();
  });
});

describe('FunnelChart', () => {
  const data = [
    { name: '访问', value: 1200 },
    { name: '加购', value: 600 },
    { name: '支付', value: 180 },
  ];

  it('每个阶段生成一个梯形', () => {
    const { container } = render(
      <FunnelChart data={data} animation={false} label={false} />,
    );
    expect(container.querySelectorAll('path').length).toBe(3);
  });

  it('外置标签额外绘制引线与说明', () => {
    const { container } = render(
      <FunnelChart data={data} animation={false} label="right" />,
    );
    expect(container.textContent).toContain('访问');
    // 引线（line）+ 名称 + 数值
    expect(container.querySelectorAll('line').length).toBeGreaterThanOrEqual(3);
  });

  // 边界：空数据展示占位
  it('空数据显示空状态', () => {
    render(<FunnelChart data={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 异常：全零数据不能除零
  it('全零数据不崩溃', () => {
    expect(() =>
      render(
        <FunnelChart
          data={[
            { name: 'A', value: 0 },
            { name: 'B', value: 0 },
          ]}
          animation={false}
        />,
      ),
    ).not.toThrow();
  });
});

describe('RingProgress', () => {
  it('渲染轨道与进度弧，中心显示百分比', () => {
    const { container } = render(<RingProgress value={68} animation={false} />);
    expect(container.querySelectorAll('path').length).toBe(2);
    expect(container.textContent).toContain('68%');
  });

  it('children 覆盖中心内容', () => {
    render(
      <RingProgress value={45} animation={false}>
        <span>自定义</span>
      </RingProgress>,
    );
    expect(screen.getByText('自定义')).toBeTruthy();
  });

  // 边界：max 为 0 时按 0% 处理而不是 NaN
  it('max 为 0 时显示 0%', () => {
    const { container } = render(
      <RingProgress value={10} max={0} animation={false} />,
    );
    expect(container.textContent).toContain('0%');
  });

  // 边界：value 超过 max 时夹紧为满环
  it('超出满值不破坏路径', () => {
    const { container } = render(
      <RingProgress value={150} max={100} animation={false} />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });
});

describe('WaterfallChart', () => {
  const data = [
    { name: '期初', value: 0, isTotal: true },
    { name: '收入', value: 1200 },
    { name: '成本', value: -400 },
    { name: '期末', value: 0, isTotal: true },
  ];

  it('为每个条目渲染一根柱子', () => {
    const { container } = render(
      <WaterfallChart data={data} animation={false} />,
    );
    expect(container.querySelectorAll('path').length).toBe(4);
  });

  it('相邻柱之间有连接线', () => {
    const { container } = render(
      <WaterfallChart data={data} animation={false} connector />,
    );
    expect(container.querySelectorAll('line').length).toBeGreaterThanOrEqual(3);
  });

  it('关闭连接线后不再绘制', () => {
    const withConnector = render(
      <WaterfallChart data={data} animation={false} connector />,
    );
    const withCount = withConnector.container.querySelectorAll('line').length;
    withConnector.unmount();

    const withoutConnector = render(
      <WaterfallChart data={data} animation={false} connector={false} />,
    );
    expect(
      withoutConnector.container.querySelectorAll('line').length,
    ).toBeLessThan(withCount);
  });

  // 边界：负值场景必须画出零基线
  it('含负值时绘制零基线', () => {
    const { container } = render(
      <WaterfallChart
        data={[
          { name: 'A', value: -500 },
          { name: 'B', value: 200 },
        ]}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('line').length).toBeGreaterThan(0);
  });

  it('空数据显示空状态', () => {
    render(<WaterfallChart data={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });
});

describe('Sparkline', () => {
  const data = [12, 18, 15, 24, 22, 30];

  it('line 形态生成一条路径', () => {
    const { container } = render(<Sparkline data={data} animation={false} />);
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(1);
  });

  it('area 形态额外生成填充路径', () => {
    const { container } = render(
      <Sparkline data={data} type="area" animation={false} />,
    );
    const fills = Array.from(container.querySelectorAll('path')).filter(
      (node) => (node.getAttribute('fill') ?? 'none') !== 'none',
    );
    expect(fills.length).toBe(1);
  });

  it('bar 形态为每个数据点生成矩形', () => {
    const { container } = render(
      <Sparkline data={data} type="bar" animation={false} />,
    );
    expect(container.querySelectorAll('rect').length).toBe(data.length);
  });

  it('showLast 高亮最后一个点', () => {
    const { container } = render(
      <Sparkline data={data} showLast animation={false} />,
    );
    expect(container.querySelectorAll('circle').length).toBe(1);
  });

  // 边界：空数据不渲染任何内容
  it('空数据返回 null', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  // 边界：单点数据也要能画出图形
  it('单点数据不产生 NaN', () => {
    const { container } = render(<Sparkline data={[5]} animation={false} />);
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });
});

describe('交互与可选分支', () => {
  it('雷达图悬浮显示 tooltip', () => {
    const { container } = render(
      <RadarChart
        animation={false}
        indicators={indicators}
        series={[{ key: 'a', name: '系列 A', values: [80, 90, 70, 85] }]}
      />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 160,
      }),
    );

    const tooltip = container.querySelector('.aura-chart__tooltip');
    expect(tooltip?.textContent).toContain('性能');
  });

  // 边界：数值超出最后一个分段时回落到末端颜色
  it('仪表盘数值超出所有分段时取末端颜色', () => {
    const { container } = render(
      <GaugeChart
        value={1200}
        max={1000}
        animation={false}
        ranges={[
          { to: 400, color: '#ef4444' },
          { to: 1000, color: '#10b981' },
        ]}
      />,
    );
    const strokes = Array.from(container.querySelectorAll('path')).map((node) =>
      node.getAttribute('stroke'),
    );
    expect(strokes).toContain('#10b981');
  });

  // 边界：层高不足时内嵌标签不渲染（避免文字溢出）
  it('漏斗图层高过小时不渲染内嵌标签', () => {
    // 覆盖默认的 640×320 盒子，模拟一个很矮的容器
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      ...RECT,
      width: 200,
      height: 60,
      right: 200,
      bottom: 60,
    } as DOMRect);
    const { container } = render(
      <FunnelChart
        data={[
          { name: 'A', value: 100 },
          { name: 'B', value: 80 },
          { name: 'C', value: 60 },
          { name: 'D', value: 40 },
          { name: 'E', value: 20 },
        ]}
        height={60}
        animation={false}
      />,
    );
    expect(container.textContent).not.toContain('A 100');
  });

  it('迷你图 smooth 形态不产生 NaN', () => {
    const { container } = render(
      <Sparkline data={[3, 9, 4, 12]} smooth animation={false} />,
    );
    const paths = Array.from(container.querySelectorAll('path')).map(
      (node) => node.getAttribute('d') ?? '',
    );
    expect(paths[0]).toContain('C');
    paths.forEach((d) => expect(d).not.toContain('NaN'));
  });

  it('环形进度关闭圆角端点后仍渲染', () => {
    const { container } = render(
      <RingProgress value={30} round={false} animation={false} />,
    );
    const arcs = Array.from(container.querySelectorAll('path')).map((node) =>
      node.getAttribute('stroke-linecap'),
    );
    expect(arcs).toContain('butt');
  });
});
