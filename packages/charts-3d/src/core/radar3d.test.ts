import { describe, expect, it } from 'vitest';
import {
  buildRadar3DModel,
  type Radar3DIndicator,
  type Radar3DSeries,
} from './radar3d';

const INDICATORS: Radar3DIndicator[] = [
  { name: '推理', max: 100 },
  { name: '代码', max: 100 },
  { name: '速度', max: 100 },
  { name: '成本', max: 100 },
];

const SERIES: Radar3DSeries[] = [
  { name: '方案A', values: [90, 80, 70, 60] },
  { name: '方案B', values: [60, 70, 95, 90] },
];

describe('buildRadar3DModel', () => {
  it('生成底层蛛网、垂直标尺柱与多层悬浮雷达多边形', () => {
    const model = buildRadar3DModel(INDICATORS, SERIES, {
      radius: 100,
      layerHeight: 30,
      rings: 4,
    });

    expect(model.indicators).toHaveLength(4);
    expect(model.series).toHaveLength(2);
    expect(model.allPoints).toHaveLength(8);
    expect(model.series[0].elevation).toBe(30);
    expect(model.series[1].elevation).toBe(60);
    // 4 圈 * 4 边 + 4 条放射轴 = 20 条线段 * 6 坐标
    expect(model.webLines).toHaveLength(20 * 6);
    // 4 根外圈垂直标尺柱 * 6 坐标
    expect(model.pillarLines).toHaveLength(4 * 6);
    // 4 个三角面 * 9 坐标；4 条外框线 * 6 坐标
    expect(model.series[0].fillPositions).toHaveLength(4 * 9);
    expect(model.series[0].outlinePositions).toHaveLength(4 * 6);
    expect(model.webLines.every(Number.isFinite)).toBe(true);
    expect(model.series[0].fillPositions.every(Number.isFinite)).toBe(true);
  });

  it('省略 indicator.max 时按全系列该维度最大值自动推导（全 0 回退 100）', () => {
    const model = buildRadar3DModel(
      [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      [{ name: 'S', values: [40, 0, 80] }],
    );

    expect(model.indicators.map((i) => i.max)).toEqual([40, 100, 80]);
    expect(model.series[0].points.map((p) => p.ratio)).toEqual([1, 0, 1]);
  });

  it('维度不足 3 个时安全返回空模型', () => {
    const model = buildRadar3DModel(
      [{ name: '仅一维' }, { name: '仅二维' }],
      SERIES,
    );
    expect(model.indicators).toEqual([]);
    expect(model.series).toEqual([]);
    expect(model.webLines).toEqual([]);
  });

  it('安全过滤空名称、非有限值与异常选项', () => {
    const model = buildRadar3DModel(
      [
        { name: '' },
        { name: '  维度1  ', max: -10 },
        { name: '维度2', max: Number.NaN },
        { name: '维度3', max: 50 },
      ],
      [
        { name: ' ', values: [1, 2, 3] },
        { name: '合法', values: [-5, Number.NaN, 120] },
      ],
      { radius: -1, layerHeight: 0, rings: 99 },
    );

    expect(model.indicators).toHaveLength(3);
    expect(model.series).toHaveLength(1);
    expect(model.radius).toBe(115);
    expect(model.layerHeight).toBe(28);
    // 负值/NaN 归 0，超上限夹紧为 ratio = 1
    expect(model.series[0].points.map((p) => p.ratio)).toEqual([0, 0, 1]);
  });
});
