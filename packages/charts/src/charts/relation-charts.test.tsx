import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SankeyChart } from './sankey-chart';
import { GraphChart } from './graph-chart';

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

const sankeyLinks = [
  { source: '入口', target: '商品页', value: 100 },
  { source: '商品页', target: '支付', value: 60 },
  { source: '商品页', target: '流失', value: 40 },
];

describe('SankeyChart', () => {
  it('为每条流向渲染一条带子，为每个节点渲染一个矩形', () => {
    const { container } = render(
      <SankeyChart links={sankeyLinks} animation={false} />,
    );
    expect(container.querySelectorAll('path')).toHaveLength(3);
    expect(container.querySelectorAll('rect')).toHaveLength(4);
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
  });

  it('只传 links 时自动推导节点名并渲染标签', () => {
    const { container } = render(
      <SankeyChart links={sankeyLinks} animation={false} />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    expect(texts.some((text) => text.includes('入口'))).toBe(true);
    expect(texts.some((text) => text.includes('流失'))).toBe(true);
  });

  it('空数据显示占位', () => {
    render(<SankeyChart links={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 异常：只有自环时无法布局，走空状态
  it('全部为自环时展示占位', () => {
    render(
      <SankeyChart
        links={[{ source: 'A', target: 'A', value: 10 }]}
        emptyText="暂无数据"
      />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：关闭数值标签后末层只剩节点名
  it('showValue 关闭时标签不含数值', () => {
    const { container } = render(
      <SankeyChart links={sankeyLinks} showValue={false} animation={false} />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    expect(texts.some((text) => /\d/.test(text))).toBe(false);
  });

  it('悬浮流向时显示 tooltip', () => {
    const { container } = render(
      <SankeyChart links={sankeyLinks} animation={false} />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    // 命中链接中部：x 处于两列节点之间
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 320,
        clientY: 160,
      }),
    );
    expect(container.querySelector('.aura-chart__tooltip')).not.toBeNull();
  });
});

const graphNodes = [
  { id: 'a', name: '甲', group: 'g1' },
  { id: 'b', name: '乙', group: 'g1' },
  { id: 'c', name: '丙', group: 'g2' },
];

const graphLinks = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
];

describe('GraphChart', () => {
  it('每个节点一个圆点、每条关系一条线', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        animation={false}
        iterations={60}
      />,
    );
    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(container.querySelectorAll('line')).toHaveLength(2);
  });

  it('showLabel 为 false 时不渲染标签', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        showLabel={false}
        animation={false}
        iterations={60}
      />,
    );
    expect(container.querySelectorAll('text')).toHaveLength(0);
  });

  it('不同分组用不同颜色', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        animation={false}
        iterations={60}
      />,
    );
    const fills = new Set(
      Array.from(container.querySelectorAll('circle')).map((node) =>
        node.getAttribute('fill'),
      ),
    );
    expect(fills.size).toBeGreaterThan(1);
  });

  it('空数据显示占位', () => {
    render(<GraphChart nodes={[]} links={[]} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：单节点无关系也能渲染
  it('单节点正常渲染', () => {
    const { container } = render(
      <GraphChart
        nodes={[{ id: 'only', name: '唯一' }]}
        links={[]}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });

  it('悬浮节点时高亮并显示 tooltip', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        animation={false}
        iterations={60}
      />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    // 命中第一个节点的位置：直接从 DOM 读圆心
    const circle = container.querySelector('circle')!;
    const cx = Number(circle.getAttribute('cx'));
    const cy = Number(circle.getAttribute('cy'));
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: cx,
        clientY: cy,
      }),
    );

    expect(
      container.querySelector('.aura-chart__tooltip')?.textContent,
    ).toContain('连接数');
  });
});

describe('关系图边界', () => {
  // 边界：关闭按度缩放后所有节点半径一致
  it('scaleByDegree 关闭时节点等大', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        scaleByDegree={false}
        nodeSize={6}
        showLabel={false}
        animation={false}
        iterations={60}
      />,
    );
    const radii = new Set(
      Array.from(container.querySelectorAll('circle')).map((node) =>
        Number(node.getAttribute('r')),
      ),
    );
    expect(radii.size).toBe(1);
  });

  // 边界：悬停节点时邻居保持高亮、其余变淡
  it('悬停节点时非邻居变淡', () => {
    const { container } = render(
      <GraphChart
        nodes={graphNodes}
        links={graphLinks}
        animation={false}
        iterations={60}
      />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    const circle = container.querySelector('circle')!;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: Number(circle.getAttribute('cx')),
        clientY: Number(circle.getAttribute('cy')),
      }),
    );

    const opacities = Array.from(container.querySelectorAll('circle')).map(
      (node) => Number(node.getAttribute('opacity') ?? 1),
    );
    expect(Math.min(...opacities)).toBeLessThan(1);
  });

  // 边界：桑基图节点之间没有连线时（孤岛）不报错
  it('桑基图存在孤立节点时仍渲染其余部分', () => {
    const { container } = render(
      <SankeyChart
        nodes={[{ name: 'A' }, { name: 'B' }, { name: '孤岛' }]}
        links={[{ source: 'A', target: 'B', value: 10 }]}
        animation={false}
      />,
    );
    expect(container.querySelectorAll('rect').length).toBeGreaterThanOrEqual(1);
  });
});
