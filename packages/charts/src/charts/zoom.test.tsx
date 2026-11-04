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

const data = Array.from({ length: 300 }, (_, index) => ({
  x: `${index}`,
  value: Math.sin(index / 8) * 40 + 100,
}));

const series = [{ key: 'value', name: '数值' }];

describe('dataZoom', () => {
  it('开启后渲染缩略轴', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        dataZoom
        animation={false}
      />,
    );
    expect(container.querySelector('.aura-chart__zoom')).not.toBeNull();
    expect(container.querySelectorAll('.aura-chart__zoom-handle')).toHaveLength(
      2,
    );
  });

  it('未开启时不渲染缩略轴', () => {
    const { container } = render(
      <LineChart data={data} xKey="x" series={series} animation={false} />,
    );
    expect(container.querySelector('.aura-chart__zoom')).toBeNull();
  });

  it('dataZoom.show 为 false 时不渲染', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        dataZoom={{ show: false }}
        animation={false}
      />,
    );
    expect(container.querySelector('.aura-chart__zoom')).toBeNull();
  });

  // 受控窗口：只渲染窗口内的点
  it('受控 zoom 只渲染窗口内的数据', () => {
    const full = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        dataZoom
        zoom={[0, 1]}
        animation={false}
      />,
    );
    const fullPath =
      full.container.querySelector('path')?.getAttribute('d') ?? '';
    full.unmount();

    const half = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        dataZoom
        zoom={[0, 0.5]}
        animation={false}
      />,
    );
    const halfPath =
      half.container.querySelector('path')?.getAttribute('d') ?? '';

    expect(halfPath.length).toBeLessThan(fullPath.length);
    expect(halfPath).not.toContain('NaN');
  });

  it('缩略轴窗口宽度反映 zoom 比例', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        dataZoom
        zoom={[0.2, 0.6]}
        animation={false}
      />,
    );
    const style =
      container
        .querySelector('.aura-chart__zoom-window')
        ?.getAttribute('style') ?? '';
    expect(style).toContain('40%');
  });
});

describe('sampling', () => {
  const bigData = Array.from({ length: 3000 }, (_, index) => ({
    x: `${index}`,
    value: Math.sin(index / 40) * 50 + Math.sin(index / 7) * 8 + 100,
  }));

  it('大数据量时折线点数被压到阈值附近', () => {
    const { container } = render(
      <LineChart
        data={bigData}
        xKey="x"
        series={series}
        sampling={120}
        animation={false}
        renderer="svg"
      />,
    );
    const path = container.querySelector('path')?.getAttribute('d') ?? '';
    // 每个点会生成一段 C 指令（三次贝塞尔）
    const segments = path.split('C').length - 1;
    expect(segments).toBeLessThanOrEqual(130);
    expect(segments).toBeGreaterThan(50);
  });

  it('sampling 关闭时保留全部点', () => {
    const { container } = render(
      <LineChart
        data={bigData}
        xKey="x"
        series={series}
        sampling={false}
        animation={false}
        renderer="svg"
      />,
    );
    const path = container.querySelector('path')?.getAttribute('d') ?? '';
    const segments = path.split('C').length - 1;
    expect(segments).toBeGreaterThan(1000);
  });

  // 边界：数据量小于阈值时不做处理
  it('数据量小于阈值时不采样', () => {
    const { container } = render(
      <LineChart
        data={data}
        xKey="x"
        series={series}
        sampling={1000}
        animation={false}
      />,
    );
    const path = container.querySelector('path')?.getAttribute('d') ?? '';
    expect(path).not.toContain('NaN');
  });
});
