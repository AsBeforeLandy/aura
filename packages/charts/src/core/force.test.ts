import { describe, it, expect } from 'vitest';
import { layoutForce, type ForceLink, type ForceNode } from './force';

const rect = { x: 0, y: 0, width: 400, height: 320 };

const nodes: ForceNode[] = [
  { id: 'a', group: 'g1' },
  { id: 'b', group: 'g1' },
  { id: 'c', group: 'g2' },
  { id: 'd', group: 'g2' },
];

const links: ForceLink[] = [
  { source: 'a', target: 'b' },
  { source: 'c', target: 'd' },
  { source: 'b', target: 'c' },
];

describe('layoutForce', () => {
  it('返回与输入等量的节点位置', () => {
    const result = layoutForce(nodes, links, rect);
    expect(result).toHaveLength(4);
    expect(result.map((item) => item.id).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('所有坐标落在画布内', () => {
    const result = layoutForce(nodes, links, rect, { radius: 10 });
    result.forEach((item) => {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x).toBeLessThanOrEqual(rect.width);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.y).toBeLessThanOrEqual(rect.height);
    });
  });

  // 确定性：同一输入两次布局必须一致，否则每次刷新图都不一样
  it('同一输入的布局结果可复现', () => {
    const first = layoutForce(nodes, links, rect);
    const second = layoutForce(nodes, links, rect);
    first.forEach((item, index) => {
      expect(item.x).toBeCloseTo(second[index].x, 6);
      expect(item.y).toBeCloseTo(second[index].y, 6);
    });
  });

  it('统计每个节点的连接数', () => {
    const result = layoutForce(nodes, links, rect);
    const degree = (id: string) =>
      result.find((item) => item.id === id)!.degree;
    expect(degree('b')).toBe(2);
    expect(degree('a')).toBe(1);
  });

  // 边界：单节点居中
  it('单节点落在画布中心', () => {
    const [only] = layoutForce([{ id: 'solo' }], [], rect);
    expect(only.x).toBeCloseTo(rect.width / 2, 5);
    expect(only.y).toBeCloseTo(rect.height / 2, 5);
  });

  // 边界：没有边时节点仍应被推开，而不是全叠在中心
  it('无边时节点互相分散', () => {
    const result = layoutForce(nodes, [], rect, { iterations: 60 });
    const distinct = new Set(
      result.map((item) => `${Math.round(item.x)}-${Math.round(item.y)}`),
    );
    expect(distinct.size).toBeGreaterThan(1);
  });

  // 异常：引用不存在节点的边被忽略
  it('忽略指向不存在节点的边', () => {
    const result = layoutForce(nodes, [{ source: 'a', target: 'zzz' }], rect);
    expect(result.find((item) => item.id === 'a')!.degree).toBe(0);
  });

  it('空节点返回空数组', () => {
    expect(layoutForce([], [], rect)).toEqual([]);
  });
});
