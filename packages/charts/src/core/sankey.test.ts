import { describe, it, expect } from 'vitest';
import { layoutSankey, type SankeyLinkInput, type SankeyNode } from './sankey';

const rect = { x: 0, y: 0, width: 400, height: 300 };
const colorOf = (layer: number) => `c${layer}`;

const nodes: SankeyNode[] = [
  { name: 'A' },
  { name: 'B' },
  { name: 'C' },
  { name: 'D' },
];

const links: SankeyLinkInput[] = [
  { source: 'A', target: 'B', value: 60 },
  { source: 'A', target: 'C', value: 40 },
  { source: 'B', target: 'D', value: 60 },
  { source: 'C', target: 'D', value: 40 },
];

describe('layoutSankey', () => {
  it('按最长路径分层', () => {
    const result = layoutSankey(nodes, links, rect, { colorOf });
    const layerOf = (name: string) =>
      result.nodes.find((node) => node.name === name)!.layer;
    expect(layerOf('A')).toBe(0);
    expect(layerOf('B')).toBe(1);
    expect(layerOf('C')).toBe(1);
    expect(layerOf('D')).toBe(2);
    expect(result.layers).toBe(3);
  });

  it('同层节点纵向不重叠', () => {
    const result = layoutSankey(nodes, links, rect, { colorOf, nodeGap: 10 });
    const middle = result.nodes
      .filter((node) => node.layer === 1)
      .sort((a, b) => a.y - b.y);
    expect(middle[0].y + middle[0].height).toBeLessThanOrEqual(
      middle[1].y + 0.01,
    );
  });

  // 关键：节点的入/出带宽之和应等于节点高度（端口按顺序切分）
  it('同一节点上的带宽之和等于其高度', () => {
    const result = layoutSankey(nodes, links, rect, { colorOf });
    const sourceLinks = result.links.filter((link) => link.source.name === 'A');
    const totalThickness = sourceLinks.reduce(
      (sum, link) => sum + link.sourceThickness,
      0,
    );
    const nodeA = result.nodes.find((node) => node.name === 'A')!;
    expect(totalThickness).toBeCloseTo(nodeA.height, 3);
  });

  it('链接路径不含 NaN', () => {
    const result = layoutSankey(nodes, links, rect, { colorOf });
    result.links.forEach((link) => expect(link.d).not.toContain('NaN'));
  });

  // 异常：自环与不存在的节点被忽略
  it('过滤自环与无效节点', () => {
    const result = layoutSankey(
      nodes,
      [
        { source: 'A', target: 'A', value: 10 },
        { source: 'A', target: 'ZZZ', value: 5 },
        { source: 'A', target: 'B', value: 20 },
      ],
      rect,
      { colorOf },
    );
    expect(result.links).toHaveLength(1);
  });

  // 异常：含环数据不能死循环
  it('含环数据不挂起', () => {
    const cyclic: SankeyLinkInput[] = [
      { source: 'A', target: 'B', value: 10 },
      { source: 'B', target: 'C', value: 10 },
      { source: 'C', target: 'A', value: 10 },
    ];
    const result = layoutSankey(nodes.slice(0, 3), cyclic, rect, { colorOf });
    expect(result.nodes).toHaveLength(3);
    result.nodes.forEach((node) => expect(Number.isFinite(node.y)).toBe(true));
  });

  // 边界：空数据
  it('空数据返回空结果', () => {
    expect(layoutSankey([], [], rect, { colorOf })).toEqual({
      nodes: [],
      links: [],
      layers: 0,
    });
  });

  it('全部流量为 0 时返回空结果', () => {
    const result = layoutSankey(
      nodes,
      [{ source: 'A', target: 'B', value: 0 }],
      rect,
      { colorOf },
    );
    expect(result.nodes).toEqual([]);
  });
});
