import { describe, expect, it } from 'vitest';
import {
  buildNetworkModel,
  type Network3DLayout,
  type Network3DModel,
  type Network3DNode,
} from './network';

function expectFiniteModel(model: Network3DModel): void {
  model.nodes.forEach((node) => {
    expect(Number.isFinite(node.radius)).toBe(true);
    node.position.forEach((coordinate) =>
      expect(Number.isFinite(coordinate)).toBe(true),
    );
  });
}

const NODES: Network3DNode[] = [
  { id: 'a', label: 'A', category: '核心', value: 10 },
  { id: 'b', label: 'B', category: '边缘', value: 20 },
  { id: 'c', label: 'C', category: '核心', value: 30 },
  { id: 'd', label: 'D' },
];

describe('buildNetworkModel', () => {
  it('清洗数据并计算稳定分类、度数与半径', () => {
    const model = buildNetworkModel(
      NODES,
      [
        { source: 'a', target: 'b', value: 2 },
        { source: 'b', target: 'c', value: 3 },
        { source: 'missing', target: 'a' },
        { source: 'a', target: 'a' },
        { source: 'a', target: 'c', value: Number.NaN },
      ],
      { layout: 'grid', nodeSize: 10 },
    );

    expect(model.nodes.map((node) => node.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(model.categories).toEqual(['核心', '边缘', '未分类']);
    expect(model.nodes.map((node) => node.categoryIndex)).toEqual([0, 1, 0, 2]);
    expect(model.nodes.map((node) => node.degree)).toEqual([1, 2, 1, 0]);
    expect(model.links).toHaveLength(2);
    expect(model.links[0]).toMatchObject({
      sourceIndex: 0,
      targetIndex: 1,
      value: 2,
    });
    expect(model.nodes[0].radius).toBeCloseTo(8);
    expect(model.nodes[1].radius).toBeCloseTo(10);
    expect(model.nodes[2].radius).toBeCloseTo(12);
    expect(model.nodes[3].radius).toBeCloseTo(10);
    expectFiniteModel(model);
  });

  it('空数据返回空模型', () => {
    const model = buildNetworkModel();
    expect(model.nodes).toEqual([]);
    expect(model.links).toEqual([]);
    expect(model.categories).toEqual([]);
    expect(model.layout).toBe('force');
    expectFiniteModel(model);
  });

  it('单节点在三种布局下都保持有限坐标', () => {
    (['force', 'sphere', 'grid'] as const).forEach((layout) => {
      const model = buildNetworkModel([{ id: 'only', value: 4 }], [], {
        layout,
      });
      expect(model.nodes).toHaveLength(1);
      expect(model.nodes[0].degree).toBe(0);
      expect(model.nodes[0].radius).toBe(5);
      expectFiniteModel(model);
    });
  });

  it('过滤空 id、非法 id、重复 id 并保留首个节点', () => {
    const model = buildNetworkModel([
      { id: '' },
      { id: '   ' },
      { id: 42 as unknown as string },
      { id: 'a', label: 'first' },
      { id: 'a', label: 'second' },
    ]);
    expect(model.nodes.map((node) => node.id)).toEqual(['a']);
    expect(model.nodes[0].label).toBe('first');
    expect(model.nodes[0].node.label).toBe('first');
  });

  it('过滤 NaN 与 Infinity 节点值', () => {
    const model = buildNetworkModel([
      { id: 'ok', value: 0 },
      { id: 'nan', value: Number.NaN },
      { id: 'positive', value: Number.POSITIVE_INFINITY },
      { id: 'negative', value: Number.NEGATIVE_INFINITY },
    ]);
    expect(model.nodes.map((node) => node.id)).toEqual(['ok']);
    expectFiniteModel(model);
  });

  it('非法节点值不占用 id，保留后续首个合法同 id 节点', () => {
    const model = buildNetworkModel([
      { id: 'a', value: Number.NaN },
      { id: 'a', value: 10 },
      { id: 'a', value: 20 },
    ]);
    expect(model.nodes).toHaveLength(1);
    expect(model.nodes[0]).toMatchObject({ id: 'a', value: 10 });
    expectFiniteModel(model);
  });

  it('忽略缺失端点、自环、非法端点与非有限连线值', () => {
    const model = buildNetworkModel(
      [{ id: 'a' }, { id: 'b' }],
      [
        { source: 'missing', target: 'a' },
        { source: 'a', target: 'missing' },
        { source: 'a', target: 'a' },
        { source: 1 as unknown as string, target: 'b' },
        { source: 'a', target: 'b', value: Number.POSITIVE_INFINITY },
        { source: 'a', target: 'b', value: 1 },
      ],
    );
    expect(model.links).toHaveLength(1);
    expect(model.links[0].value).toBe(1);
    expect(model.nodes.map((node) => node.degree)).toEqual([1, 1]);
  });

  it('固定坐标在三种布局中都不参与位移', () => {
    (['force', 'sphere', 'grid'] as const).forEach((layout) => {
      const model = buildNetworkModel(
        [{ id: 'fixed', position: [10, 20, 30] }, { id: 'free' }],
        [{ source: 'fixed', target: 'free' }],
        { layout },
      );
      expect(model.nodes[0].fixed).toBe(true);
      expect(model.nodes[0].position).toEqual([10, 20, 30]);
      expect(model.nodes[1].fixed).toBe(false);
      expectFiniteModel(model);
    });
  });

  it('非法固定坐标按自动布局处理且不产生 NaN', () => {
    const sparsePosition = Array<number>(3);
    sparsePosition[0] = 1;
    sparsePosition[2] = 3;
    (['force', 'sphere', 'grid'] as const).forEach((layout) => {
      const model = buildNetworkModel(
        [
          { id: 'nan', position: [Number.NaN, 0, 0] },
          { id: 'infinite', position: [0, Number.POSITIVE_INFINITY, 0] },
          {
            id: 'sparse',
            position: sparsePosition as unknown as [number, number, number],
          },
          { id: 'valid', position: [1, 2, 3] },
        ],
        [],
        { layout },
      );
      expect(model.nodes[0].fixed).toBe(false);
      expect(model.nodes[1].fixed).toBe(false);
      expect(model.nodes[2].fixed).toBe(false);
      expect(model.nodes[3].position).toEqual([1, 2, 3]);
      expectFiniteModel(model);
    });
  });

  it('force 使用种子初始化，同数据同种子布局稳定', () => {
    const nodes = Array.from({ length: 18 }, (_, index) => ({
      id: `node-${index}`,
      value: index,
    }));
    const links = nodes.slice(1).map((node, index) => ({
      source: nodes[index].id,
      target: node.id,
    }));
    const first = buildNetworkModel(nodes, links, { seed: 7, iterations: 80 });
    const second = buildNetworkModel(nodes, links, { seed: 7, iterations: 80 });
    const other = buildNetworkModel(nodes, links, { seed: 8, iterations: 80 });

    expect(first.nodes.map((node) => node.position)).toEqual(
      second.nodes.map((node) => node.position),
    );
    expect(first.nodes.map((node) => node.position)).not.toEqual(
      other.nodes.map((node) => node.position),
    );
    expectFiniteModel(first);
  });

  it('重合节点与全等值不会导致除零或 NaN', () => {
    const model = buildNetworkModel(
      [
        { id: 'a', value: 7, position: [0, 0, 0] },
        { id: 'b', value: 7, position: [0, 0, 0] },
        { id: 'c', value: 7 },
        { id: 'd', value: 7 },
      ],
      [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'c', target: 'd' },
      ],
      { iterations: 120 },
    );
    expect(new Set(model.nodes.map((node) => node.radius))).toEqual(
      new Set([5]),
    );
    expectFiniteModel(model);
  });

  it('sphere 与 grid 按输入稳定排序且坐标落在布局半径内', () => {
    const nodes = Array.from({ length: 12 }, (_, index) => ({
      id: `node-${index}`,
    }));
    (['sphere', 'grid'] as const).forEach((layout) => {
      const first = buildNetworkModel(nodes, [], { layout, layoutRadius: 90 });
      const second = buildNetworkModel(nodes, [], { layout, layoutRadius: 90 });
      expect(first.layout).toBe(layout);
      expect(first.nodes.map((node) => node.id)).toEqual(
        nodes.map((node) => node.id),
      );
      expect(first.nodes.map((node) => node.position)).toEqual(
        second.nodes.map((node) => node.position),
      );
      first.nodes.forEach((node) => {
        node.position.forEach((coordinate) =>
          expect(Math.abs(coordinate)).toBeLessThanOrEqual(90.000001),
        );
      });
      expectFiniteModel(first);
    });
  });

  it('grid 使用稳定的立方网格顺序', () => {
    const nodes = Array.from({ length: 8 }, (_, index) => ({ id: `${index}` }));
    const model = buildNetworkModel(nodes, [], {
      layout: 'grid',
      layoutRadius: 140,
    });
    expect(new Set(model.nodes.map((node) => node.position[0]))).toEqual(
      new Set([-70, 70]),
    );
    expect(new Set(model.nodes.map((node) => node.position[1]))).toEqual(
      new Set([-70, 70]),
    );
    expect(new Set(model.nodes.map((node) => node.position[2]))).toEqual(
      new Set([-70, 70]),
    );
    expect(
      new Set(model.nodes.map((node) => node.position.join(','))).size,
    ).toBe(8);
  });

  it('超过 600 个节点时 force 自动退化为 sphere', () => {
    const nodes = Array.from({ length: 601 }, (_, index) => ({
      id: `node-${index}`,
    }));
    const force = buildNetworkModel(nodes, [], {
      layout: 'force',
      iterations: 240,
    });
    const sphere = buildNetworkModel(nodes, [], { layout: 'sphere' });
    expect(force.layout).toBe('sphere');
    expect(force.nodes.map((node) => node.position)).toEqual(
      sphere.nodes.map((node) => node.position),
    );
    expectFiniteModel(force);
  });

  it('迭代次数、半径与尺寸异常输入被安全归一化', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }];
    expect(buildNetworkModel(nodes, [], { iterations: 0 }).iterations).toBe(20);
    expect(buildNetworkModel(nodes, [], { iterations: 9999 }).iterations).toBe(
      240,
    );
    expect(
      buildNetworkModel(nodes, [], { iterations: Number.NaN }).iterations,
    ).toBe(120);

    const model = buildNetworkModel(nodes, [], {
      layout: 'invalid' as Network3DLayout,
      layoutRadius: Number.NaN,
      nodeSize: Number.POSITIVE_INFINITY,
      seed: Number.NaN,
    });
    expect(model.layout).toBe('force');
    expect(model.layoutRadius).toBe(140);
    expectFiniteModel(model);
  });
});
