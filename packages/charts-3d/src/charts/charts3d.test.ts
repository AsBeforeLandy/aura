import { describe, it, expect } from 'vitest';
import { buildSurfaceGeometryData, sampleGradient } from './Surface3D';
import { buildScatterModel } from './Scatter3D';

describe('buildSurfaceGeometryData', () => {
  const options = {
    width: 200,
    depth: 200,
    maxHeight: 100,
    colorRange: ['#000', '#fff'],
  };

  it('为 3x3 矩阵生成 9 个顶点与 8 个三角面（24 个索引）', () => {
    const result = buildSurfaceGeometryData(
      [
        [0, 1, 2],
        [1, 2, 3],
        [2, 3, 4],
      ],
      options,
    );
    expect(result.positions).toHaveLength(27); // 9 顶点 × 3
    expect(result.colors).toHaveLength(27);
    expect(result.indices).toHaveLength(24); // (3-1)² × 2 三角 × 3 索引
  });

  it('最大值顶点在最高处，最小值在基线', () => {
    const result = buildSurfaceGeometryData(
      [
        [0, 100],
        [100, 0],
      ],
      options,
    );
    // positions[i*3+1] 是 y：最小 0、最大 100
    const ys = [0, 1, 2, 3].map((vertex) => result.positions[vertex * 3 + 1]);
    expect(Math.min(...ys)).toBe(0);
    expect(Math.max(...ys)).toBe(100);
  });

  it('顶点色落在色带端点色之间', () => {
    const result = buildSurfaceGeometryData(
      [
        [0, 100],
        [50, 100],
      ],
      { ...options, colorRange: ['#000000', '#ffffff'] },
    );
    // 顶点色是 0~1 的 RGB：最亮顶点接近白，最暗接近黑
    const maxChannel = Math.max(...result.colors);
    const minChannel = Math.min(...result.colors);
    expect(maxChannel).toBeGreaterThan(0.9);
    expect(minChannel).toBeLessThan(0.1);
  });

  // 边界：单行 / 单列矩阵退化成线，不产生索引
  it('单行矩阵不产生三角面', () => {
    const result = buildSurfaceGeometryData([[1, 2, 3]], options);
    expect(result.positions).toHaveLength(9);
    expect(result.indices).toHaveLength(0);
  });

  // 异常：空矩阵与 NaN 值不能产生 NaN 顶点
  it('空矩阵返回空几何', () => {
    const result = buildSurfaceGeometryData([], options);
    expect(result.positions).toHaveLength(0);
    expect(result.indices).toHaveLength(0);
  });

  it('NaN 值按 0 参与，不产生 NaN 顶点', () => {
    const result = buildSurfaceGeometryData(
      [
        [Number.NaN, 10],
        [20, Number.NaN],
      ],
      options,
    );
    result.positions.forEach((coordinate) =>
      expect(Number.isFinite(coordinate)).toBe(true),
    );
  });
});

describe('sampleGradient', () => {
  it('两端与中点取样', () => {
    expect(sampleGradient(['#000000', '#ffffff'], 0)).toBe('rgb(0, 0, 0)');
    expect(sampleGradient(['#000000', '#ffffff'], 1)).toBe(
      'rgb(255, 255, 255)',
    );
  });

  it('三段色带在中点命中第二段', () => {
    const mid = sampleGradient(['#000000', '#808080', '#ffffff'], 0.5);
    expect(mid).toBe('rgb(128, 128, 128)');
  });

  // 边界：越界输入被夹紧
  it('t 超出 0~1 时被夹紧', () => {
    expect(sampleGradient(['#000000', '#ffffff'], -1)).toBe('rgb(0, 0, 0)');
    expect(sampleGradient(['#000000', '#ffffff'], 2)).toBe(
      'rgb(255, 255, 255)',
    );
  });

  it('单色色带恒定返回', () => {
    expect(sampleGradient(['#ff0000'], 0.3)).toBe('#ff0000');
    expect(sampleGradient([], 0.5)).toBe('#888888');
  });
});

describe('buildScatterModel', () => {
  const data = [
    { x: 0, y: 10, z: 0 },
    { x: 100, y: 50, z: 100 },
    { x: 50, y: 30, z: 50 },
  ];

  it('三个数值维度都被归一到轴长的一半范围内', () => {
    const model = buildScatterModel(data, 240, {});
    model.points.forEach((item) => {
      expect(Math.abs(item.position.x)).toBeLessThanOrEqual(120.0001);
      expect(Math.abs(item.position.y)).toBeLessThanOrEqual(120.0001);
      expect(Math.abs(item.position.z)).toBeLessThanOrEqual(120.0001);
    });
  });

  it('y 值映射到高度比例', () => {
    const model = buildScatterModel(data, 240, {});
    const ratios = model.points.map((item) => item.valueRatio);
    expect(Math.min(...ratios)).toBe(0);
    expect(Math.max(...ratios)).toBe(1);
  });

  it('自定义量程覆盖自动计算', () => {
    const model = buildScatterModel(data, 240, { y: [0, 1000] });
    // y 的最大值 50 只到量程 1000 的 5%
    const highest = Math.max(...model.points.map((item) => item.position.y));
    expect(highest).toBeLessThan(0);
    // 0.05 - 0.5 = -0.45 → -0.45 * 240 = -108（居中映射，中点以下）
  });

  // 边界：全等值坐标居中
  it('全等值时坐标落在中点', () => {
    const model = buildScatterModel(
      [
        { x: 5, y: 5, z: 5 },
        { x: 5, y: 5, z: 5 },
      ],
      240,
      {},
    );
    model.points.forEach((item) => {
      expect(item.position.x).toBe(0);
      expect(item.position.y).toBe(0);
      expect(item.position.z).toBe(0);
    });
  });

  it('空数据返回空点位', () => {
    expect(buildScatterModel([], 240, {}).points).toHaveLength(0);
  });
});
