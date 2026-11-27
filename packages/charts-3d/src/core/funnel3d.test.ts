import { describe, expect, it } from 'vitest';
import { buildFunnel3DModel, type Funnel3DStage } from './funnel3d';

const STAGES: Funnel3DStage[] = [
  { name: '曝光', value: 1000 },
  { name: '注册', value: 500 },
  { name: '付费', value: 100 },
];

describe('buildFunnel3DModel', () => {
  it('漏斗模式准确计算环节转化率、总转化率与自上而下递减半径', () => {
    const model = buildFunnel3DModel(STAGES, {
      variant: 'funnel',
      height: 200,
      maxRadius: 100,
      gap: 8,
    });

    expect(model.variant).toBe('funnel');
    expect(model.stages).toHaveLength(3);
    expect(model.stages.map((s) => s.overallRate)).toEqual([1, 0.5, 0.1]);
    expect(model.stages.map((s) => s.stepRate)).toEqual([1, 0.5, 0.2]);
    // 顶部高于底部，且上一层底半径与下一层顶半径衔接
    expect(model.stages[0].centerY).toBeGreaterThan(model.stages[1].centerY);
    expect(model.stages[1].centerY).toBeGreaterThan(model.stages[2].centerY);
    expect(model.stages[0].bottomRadius).toBeCloseTo(
      model.stages[1].topRadius,
      6,
    );
    expect(model.stages[0].topRadius).toBeGreaterThan(
      model.stages[0].bottomRadius,
    );
  });

  it('金字塔模式顶端收尖、底部宽大并衔接下层', () => {
    const pyramid = buildFunnel3DModel(
      [
        { name: '顶层', value: 100 },
        { name: '中层', value: 400 },
        { name: '底层', value: 1000 },
      ],
      { variant: 'pyramid' },
    );

    expect(pyramid.variant).toBe('pyramid');
    expect(pyramid.stages[0].topRadius).toBeLessThan(
      pyramid.stages[0].bottomRadius,
    );
    expect(pyramid.stages[1].topRadius).toBeCloseTo(
      pyramid.stages[0].bottomRadius,
      6,
    );
  });

  it('空数据返回空模型，单阶段安全渲染', () => {
    expect(buildFunnel3DModel([]).stages).toEqual([]);
    const single = buildFunnel3DModel([{ name: '唯一阶段', value: 42 }]);
    expect(single.stages).toHaveLength(1);
    expect(single.stages[0].centerY).toBeCloseTo(0, 6);
  });

  it('过滤非法阶段并收敛异常高度、半径与过大缝隙', () => {
    const model = buildFunnel3DModel(
      [
        { name: '', value: 10 },
        { name: '零', value: 0 },
        { name: 'NaN', value: Number.NaN },
        { name: '有效A', value: 200 },
        { name: '有效B', value: 100 },
      ],
      { height: -10, maxRadius: Number.NaN, gap: 500 },
    );

    expect(model.stages.map((s) => s.name)).toEqual(['有效A', '有效B']);
    expect(model.totalHeight).toBe(210);
    expect(model.maxRadius).toBe(105);
    expect(model.stages[0].height).toBeGreaterThan(0);
  });
});
