import { describe, it, expect } from 'vitest';
import {
  buildTreemap,
  countLeaves,
  layoutTree,
  maxDepth,
  squarify,
  sumValues,
  treeLinkPath,
  type HierarchyNode,
} from './hierarchy';
import { createChartTheme } from '../theme';

const theme = createChartTheme();

const rect = { x: 0, y: 0, width: 400, height: 200 };
const areaOf = (r: { width: number; height: number }) => r.width * r.height;

describe('sumValues / countLeaves / maxDepth', () => {
  const tree: HierarchyNode = {
    name: 'root',
    children: [
      { name: 'a', value: 10 },
      {
        name: 'b',
        children: [
          { name: 'b1', value: 20 },
          { name: 'b2', value: 30 },
        ],
      },
    ],
  };

  it('分支节点取子节点之和', () => {
    expect(sumValues(tree)).toBe(60);
    expect(sumValues(tree.children![1])).toBe(50);
  });

  it('叶子数按无 children 的节点统计', () => {
    expect(countLeaves(tree)).toBe(3);
  });

  it('深度以根为 0', () => {
    expect(maxDepth(tree)).toBe(2);
    expect(maxDepth({ name: 'leaf', value: 1 })).toBe(0);
  });
});

describe('squarify', () => {
  it('矩形总面积等于容器面积', () => {
    const rects = squarify([40, 30, 20, 10], rect);
    const total = rects.reduce((sum, item) => sum + areaOf(item), 0);
    expect(total).toBeCloseTo(400 * 200, 0);
  });

  it('各块面积与数值成比例', () => {
    const values = [40, 30, 20, 10];
    const rects = squarify(values, rect);
    const total = areaOf(rect);
    const sum = values.reduce((a, b) => a + b, 0);

    rects.forEach((item, index) => {
      expect(areaOf(item)).toBeCloseTo((values[index] / sum) * total, 0);
    });
  });

  it('矩形互不重叠且不越界', () => {
    const rects = squarify([50, 30, 20, 15, 10, 5], rect);
    for (let i = 0; i < rects.length; i += 1) {
      expect(rects[i].x).toBeGreaterThanOrEqual(-0.01);
      expect(rects[i].y).toBeGreaterThanOrEqual(-0.01);
      expect(rects[i].x + rects[i].width).toBeLessThanOrEqual(
        rect.width + 0.01,
      );
      expect(rects[i].y + rects[i].height).toBeLessThanOrEqual(
        rect.height + 0.01,
      );
    }
  });

  // squarified 的核心收益：不出现极端细长的条
  it('最差宽高比保持在可控范围', () => {
    const rects = squarify([50, 30, 20, 15, 10, 5], rect);
    const worst = Math.max(
      ...rects.map((item) =>
        Math.max(item.width / item.height, item.height / item.width),
      ),
    );
    expect(worst).toBeLessThan(6);
  });

  // 边界：全零 / 空输入不能让布局除零
  it('全零数据返回零尺寸矩形', () => {
    const rects = squarify([0, 0], rect);
    expect(rects).toHaveLength(2);
    rects.forEach((item) => expect(areaOf(item)).toBe(0));
  });

  it('空数组返回空结果', () => {
    expect(squarify([], rect)).toEqual([]);
  });

  it('容器尺寸为 0 时不产生 NaN', () => {
    const rects = squarify([10, 20], { x: 0, y: 0, width: 0, height: 0 });
    rects.forEach((item) => {
      expect(Number.isNaN(item.width)).toBe(false);
      expect(Number.isNaN(item.height)).toBe(false);
    });
  });
});

describe('buildTreemap', () => {
  const tree: HierarchyNode = {
    name: 'root',
    children: [
      {
        name: 'a',
        children: [
          { name: 'a1', value: 10 },
          { name: 'a2', value: 5 },
        ],
      },
      { name: 'b', value: 15 },
    ],
  };

  it('maxDepth 为 1 时只展开一层', () => {
    const cells = buildTreemap(tree, rect, { maxDepth: 1, theme });
    expect(cells.map((cell) => cell.node.name)).toEqual(['a', 'b']);
  });

  it('maxDepth 为 2 时展开到孙节点', () => {
    const cells = buildTreemap(tree, rect, { maxDepth: 2, theme });
    expect(cells.map((cell) => cell.node.name)).toEqual(['a', 'a1', 'a2', 'b']);
  });

  // 组件通过 colorOf 让子层继承父色；这里验证它确实拿到了父色
  it('colorOf 能拿到父色以便做同族浅化', () => {
    const seen: { depth: number; parentColor?: string }[] = [];
    buildTreemap(tree, rect, {
      maxDepth: 2,
      theme,
      colorOf: (depth, index, parentColor) => {
        seen.push({ depth, parentColor });
        return depth === 0 ? '#7c3aed' : (parentColor ?? '#000000');
      },
    });

    const top = seen.filter((item) => item.depth === 0);
    const nested = seen.filter((item) => item.depth === 1);
    expect(top.every((item) => item.parentColor === undefined)).toBe(true);
    expect(nested.every((item) => item.parentColor === '#7c3aed')).toBe(true);
  });

  // 边界：零总面积时返回空数组而不是抛错
  it('根节点无值时返回空', () => {
    const cells = buildTreemap({ name: 'empty', value: 0 }, rect, {
      maxDepth: 1,
      theme,
    });
    expect(cells).toEqual([]);
  });
});

describe('layoutTree', () => {
  const tree: HierarchyNode = {
    name: 'root',
    children: [
      { name: 'a', children: [{ name: 'a1' }, { name: 'a2' }] },
      { name: 'b' },
    ],
  };

  it('节点总数与树的节点数一致', () => {
    const { nodes } = layoutTree(tree, rect);
    expect(nodes).toHaveLength(5);
  });

  it('叶子纵向依次排列且不重叠', () => {
    const { nodes } = layoutTree(tree, rect);
    const leaves = nodes.filter((item) => !item.node.children?.length);
    const ys = leaves.map((item) => item.y);
    expect(ys[0]).toBeLessThan(ys[1]);
    expect(ys[1]).toBeLessThan(ys[2]);
  });

  it('父节点 y 等于子节点均值', () => {
    const { nodes } = layoutTree(tree, rect);
    const root = nodes[0];
    const childYs = nodes
      .filter((item) => item.parent === 0)
      .map((item) => item.y);
    const average =
      childYs.reduce((sum, value) => sum + value, 0) / childYs.length;
    expect(root.y).toBeCloseTo(average, 5);
  });

  it('深度换算成 x 坐标', () => {
    const { nodes } = layoutTree(tree, rect);
    const depth0 = nodes.find((item) => item.depth === 0)!;
    const depth1 = nodes.find((item) => item.depth === 1)!;
    expect(depth1.x).toBeGreaterThan(depth0.x);
  });

  // 边界：单节点树也能布局
  it('只有根节点时正常返回', () => {
    const { nodes } = layoutTree({ name: 'only' }, rect);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].parent).toBe(-1);
  });
});

describe('treeLinkPath', () => {
  it('生成正交折线（H + V + H）', () => {
    const parent = { node: { name: 'p' }, depth: 0, x: 0, y: 10, parent: -1 };
    const child = { node: { name: 'c' }, depth: 1, x: 100, y: 40, parent: 0 };
    const d = treeLinkPath(parent, child, 4);
    expect(d).toContain('H');
    expect(d).toContain('V');
    expect(d).not.toContain('NaN');
  });
});
