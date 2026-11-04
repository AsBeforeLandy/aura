import { describe, it, expect } from 'vitest';
import { computeLayout, computeXAxisLayout, suggestTickCount } from './layout';
import { createChartTheme } from '../theme';

const theme = createChartTheme();

describe('computeXAxisLayout', () => {
  it('空间充足时横排', () => {
    const result = computeXAxisLayout(['1月', '2月', '3月'], 400, theme);
    expect(result.layout).toBe('horizontal');
    expect(result.rotate).toBe(0);
    expect(result.interval).toBe(0);
  });

  it('空间不足时斜排', () => {
    // 5 个 5 字标签、可用宽 320：横向放不下（72 > 64），斜排刚好放得下（约 60 < 64）
    const labels = [
      '第一季度末',
      '第二季度末',
      '第三季度末',
      '第四季度末',
      '第五季度末',
    ];
    const result = computeXAxisLayout(labels, 320, theme);
    expect(result.layout).toBe('rotate');
    expect(result.rotate).toBeLessThan(0);
    expect(result.height).toBeGreaterThan(theme.font.size);
  });

  it('极度拥挤时抽样显示', () => {
    const labels = Array.from({ length: 60 }, (_, i) => `标签${i}`);
    const result = computeXAxisLayout(labels, 300, theme);
    expect(result.layout).toBe('horizontal');
    expect(result.interval).toBeGreaterThan(0);
  });

  // 边界：空标签数组
  it('空数组返回零高度', () => {
    const result = computeXAxisLayout([], 300, theme);
    expect(result.height).toBe(0);
  });

  // 边界：旋转标签高度有上限，避免挤占整个绘图区
  it('斜排高度不超过 72px', () => {
    const labels = ['这是一个非常非常长的分类名称', '另一个同样很长的分类名称'];
    const result = computeXAxisLayout(labels, 200, theme);
    expect(result.height).toBeLessThanOrEqual(72);
  });
});

describe('computeLayout', () => {
  it('按 y 轴标签宽度预留左侧空间', () => {
    const narrow = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['1', '2'],
      xLabels: ['A'],
      theme,
    });
    const wide = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['1,000,000', '2,000,000'],
      xLabels: ['A'],
      theme,
    });
    expect(wide.margin.left).toBeGreaterThan(narrow.margin.left);
  });

  it('绘图区高度 = 容器高度 - 上下 margin', () => {
    const result = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['0', '10'],
      xLabels: ['A'],
      theme,
    });
    expect(result.plot.height).toBeCloseTo(
      300 - result.margin.top - result.margin.bottom,
      5,
    );
    expect(result.plot.width).toBeCloseTo(
      600 - result.margin.left - result.margin.right,
      5,
    );
  });

  // 边界：隐藏坐标轴时不预留空间
  it('隐藏 x 轴后底部 margin 收窄', () => {
    const withAxis = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['0'],
      xLabels: ['A'],
      theme,
    });
    const withoutAxis = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['0'],
      xLabels: ['A'],
      theme,
      showXAxis: false,
      showYAxis: false,
    });
    expect(withoutAxis.margin.bottom).toBeLessThan(withAxis.margin.bottom);
    expect(withoutAxis.margin.left).toBeLessThan(withAxis.margin.left);
  });

  it('用户指定的 margin 覆盖自动计算', () => {
    const result = computeLayout({
      width: 600,
      height: 300,
      yLabels: ['0'],
      xLabels: ['A'],
      theme,
      margin: { left: 99 },
    });
    expect(result.margin.left).toBe(99);
  });

  // 异常：容器尺寸为 0 时不能产出负的绘图区
  it('尺寸为 0 时绘图区不为负', () => {
    const result = computeLayout({
      width: 0,
      height: 0,
      yLabels: ['0'],
      xLabels: ['A'],
      theme,
    });
    expect(result.plot.width).toBeGreaterThanOrEqual(0);
    expect(result.plot.height).toBeGreaterThanOrEqual(0);
  });
});

describe('suggestTickCount', () => {
  it('随高度增长并限制在 3~8 之间', () => {
    expect(suggestTickCount(10)).toBe(3);
    expect(suggestTickCount(200)).toBe(5);
    expect(suggestTickCount(2000)).toBe(8);
  });
});
