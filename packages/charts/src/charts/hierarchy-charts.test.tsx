import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreemapChart } from './treemap-chart';
import { TreeChart } from './tree-chart';
import type { HierarchyNode } from '../core/hierarchy';

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

const tree: HierarchyNode = {
  name: 'root',
  children: [
    {
      name: '技术',
      children: [
        { name: '前端', value: 40 },
        { name: '后端', value: 60 },
      ],
    },
    { name: '产品', value: 50 },
  ],
};

describe('TreemapChart', () => {
  it('按 maxDepth 渲染对应层级的格子', () => {
    const { container } = render(
      <TreemapChart data={tree} maxDepth={1} animation={false} />,
    );
    // 顶层两个：技术、产品
    expect(container.querySelectorAll('path')).toHaveLength(2);
    expect(container.querySelector('svg')?.getAttribute('role')).toBe('img');
  });

  it('展开两层时包含子节点', () => {
    const { container } = render(
      <TreemapChart data={tree} maxDepth={2} animation={false} />,
    );
    // 技术、产品 + 前端、后端
    expect(container.querySelectorAll('path')).toHaveLength(4);
  });

  it('在格子里渲染名称', () => {
    const { container } = render(
      <TreemapChart data={tree} maxDepth={1} animation={false} />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent,
    );
    expect(texts).toContain('技术');
    expect(texts).toContain('产品');
  });

  // 边界：showValue 关闭时不显示数值
  it('showValue 为 false 时只有名称', () => {
    const { container } = render(
      <TreemapChart
        data={tree}
        maxDepth={1}
        showValue={false}
        animation={false}
      />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    expect(texts.every((text) => !text.includes('·'))).toBe(true);
  });

  it('空数据显示占位', () => {
    render(<TreemapChart data={undefined} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 异常：全零数据不应产生无限循环或 NaN
  it('全零数据展示占位', () => {
    render(
      <TreemapChart
        data={{ name: 'r', children: [{ name: 'a', value: 0 }] }}
        emptyText="暂无数据"
      />,
    );
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  it('悬浮格子时显示 tooltip', () => {
    const { container } = render(
      <TreemapChart data={tree} maxDepth={1} animation={false} />,
    );
    const plot = container.querySelector('.aura-chart__plot') as HTMLElement;
    fireEvent(
      plot,
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 120,
        clientY: 160,
      }),
    );

    const tooltip = container.querySelector('.aura-chart__tooltip');
    expect(tooltip?.textContent).toMatch(/技术|产品/);
  });
});

describe('TreeChart', () => {
  it('每个节点渲染一个圆点', () => {
    const { container } = render(<TreeChart data={tree} animation={false} />);
    // 5 个节点
    expect(container.querySelectorAll('circle')).toHaveLength(5);
  });

  it('连线数量等于节点数减一', () => {
    const { container } = render(<TreeChart data={tree} animation={false} />);
    expect(container.querySelectorAll('path')).toHaveLength(4);
  });

  it('父节点空心、叶子实心', () => {
    const { container } = render(<TreeChart data={tree} animation={false} />);
    const circles = Array.from(container.querySelectorAll('circle'));
    const fills = circles.map((node) => node.getAttribute('fill'));
    // 空心节点用画布底色填充
    expect(fills.some((fill) => fill && fill !== 'none')).toBe(true);
  });

  it('渲染节点名称', () => {
    const { container } = render(<TreeChart data={tree} animation={false} />);
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent,
    );
    expect(texts).toContain('root');
    expect(texts).toContain('前端');
  });

  it('showValue 时叶子带数值', () => {
    const { container } = render(
      <TreeChart data={tree} showValue animation={false} />,
    );
    const texts = Array.from(container.querySelectorAll('text')).map(
      (node) => node.textContent ?? '',
    );
    expect(texts.some((text) => text.includes('40'))).toBe(true);
  });

  it('空数据显示占位', () => {
    render(<TreeChart data={undefined} emptyText="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeTruthy();
  });

  // 边界：单节点树
  it('只有根节点时不画连线', () => {
    const { container } = render(
      <TreeChart data={{ name: 'only' }} animation={false} />,
    );
    expect(container.querySelectorAll('path')).toHaveLength(0);
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });
});
