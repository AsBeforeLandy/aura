import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SvgScene } from './svg';
import { countNodes, type SceneNode } from './types';

describe('SvgScene', () => {
  it('渲染全部图元类型', () => {
    const nodes: SceneNode[] = [
      {
        kind: 'line',
        key: 'l',
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 10,
        stroke: '#000',
        strokeWidth: 2,
      },
      {
        kind: 'rect',
        key: 'r',
        x: 1,
        y: 2,
        width: 10,
        height: 8,
        radius: 2,
        fill: '#f00',
      },
      {
        kind: 'path',
        key: 'p',
        d: 'M0,0L10,10',
        stroke: '#00f',
        strokeDasharray: '3 3',
        linecap: 'round',
      },
      { kind: 'circle', key: 'c', cx: 5, cy: 5, r: 3, fill: '#0f0' },
      {
        kind: 'text',
        key: 't',
        x: 8,
        y: 9,
        text: '标签',
        fill: '#333',
        fontSize: 12,
        anchor: 'middle',
        baseline: 'middle',
        rotate: -35,
        fontWeight: 600,
      },
      {
        kind: 'group',
        key: 'g',
        transform: 'translate(4,4)',
        children: [
          { kind: 'circle', key: 'gc', cx: 1, cy: 1, r: 1, fill: '#000' },
        ],
      },
    ];

    const { container } = render(
      <SvgScene nodes={nodes} width={100} height={80} ariaLabel="测试图" />,
    );

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('测试图');
    expect(container.querySelectorAll('line')).toHaveLength(1);
    expect(container.querySelectorAll('rect')).toHaveLength(1);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.querySelector('text')?.textContent).toBe('标签');
    // 旋转文字用 transform 表达
    expect(
      container.querySelector('text')?.getAttribute('transform'),
    ).toContain('rotate');
    expect(container.querySelector('g')?.getAttribute('transform')).toBe(
      'translate(4,4)',
    );
  });

  // 边界：负尺寸被夹到 0，避免 width 为负导致浏览器报错
  it('负尺寸矩形按 0 渲染', () => {
    const { container } = render(
      <SvgScene
        nodes={[{ kind: 'rect', key: 'r', x: 0, y: 0, width: -10, height: -5 }]}
        width={50}
        height={50}
      />,
    );
    expect(container.querySelector('rect')?.getAttribute('width')).toBe('0');
  });

  // 异常：未知节点类型被忽略，不影响其余图元渲染
  it('未知节点类型被跳过', () => {
    const nodes = [
      { kind: 'unknown', key: 'u' } as unknown as SceneNode,
      {
        kind: 'circle',
        key: 'c',
        cx: 1,
        cy: 1,
        r: 1,
        fill: '#000',
      } as SceneNode,
    ];
    const { container } = render(
      <SvgScene nodes={nodes} width={50} height={50} />,
    );
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });
});

describe('countNodes', () => {
  it('递归统计节点数', () => {
    const nodes: SceneNode[] = [
      { kind: 'circle', key: 'a', cx: 0, cy: 0, r: 1 },
      {
        kind: 'group',
        key: 'g',
        children: [
          { kind: 'circle', key: 'b', cx: 0, cy: 0, r: 1 },
          {
            kind: 'group',
            key: 'g2',
            children: [
              { kind: 'rect', key: 'c', x: 0, y: 0, width: 1, height: 1 },
            ],
          },
        ],
      },
    ];
    expect(countNodes(nodes)).toBe(5);
  });

  it('空数组返回 0', () => {
    expect(countNodes([])).toBe(0);
  });
});
