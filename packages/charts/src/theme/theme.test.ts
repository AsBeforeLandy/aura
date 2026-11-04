import { describe, it, expect } from 'vitest';
import { colorAt, createChartTheme, DEFAULT_PALETTE, withAlpha } from './index';

describe('createChartTheme', () => {
  it('只覆盖传入的字段，其余保持默认', () => {
    const base = createChartTheme();
    const custom = createChartTheme({ overrides: { font: { size: 13 } } });

    expect(custom.font.size).toBe(13);
    // 未指定的同级字段不能被清空
    expect(custom.font.family).toBe(base.font.family);
    expect(custom.series.lineWidth).toBe(base.series.lineWidth);
    expect(custom.palette).toEqual(base.palette);
  });

  it('palette 快捷覆盖整套色板', () => {
    const theme = createChartTheme({ palette: ['#000', '#fff'] });
    expect(theme.palette).toEqual(['#000', '#fff']);
  });

  it('dark 模式给出不同底色', () => {
    const light = createChartTheme();
    const dark = createChartTheme({ dark: true });
    expect(dark.tooltip.background).not.toBe(light.tooltip.background);
    expect(dark.name).toBe('aura-dark');
  });

  // 边界：空色板不应把主题色板清空
  it('空 palette 不生效', () => {
    const theme = createChartTheme({ palette: [] });
    expect(theme.palette.length).toBe(DEFAULT_PALETTE.length);
  });
});

describe('colorAt', () => {
  it('按索引取色', () => {
    const theme = createChartTheme();
    expect(colorAt(theme, 0)).toBe(theme.palette[0]);
    expect(colorAt(theme, 2)).toBe(theme.palette[2]);
  });

  // 边界：索引超出色板长度时循环
  it('索引越界时循环取色', () => {
    const theme = createChartTheme({ palette: ['#111', '#222'] });
    expect(colorAt(theme, 2)).toBe('#111');
    expect(colorAt(theme, 3)).toBe('#222');
  });

  // 异常：负数索引不能取出 undefined
  it('负数索引回绕到末尾', () => {
    const theme = createChartTheme({ palette: ['#111', '#222'] });
    expect(colorAt(theme, -1)).toBe('#222');
  });
});

describe('withAlpha', () => {
  it('支持 6 位 hex', () => {
    expect(withAlpha('#7c3aed', 0.5)).toBe('rgba(124, 58, 237, 0.5)');
  });

  it('支持 3 位 hex 简写', () => {
    expect(withAlpha('#fff', 0.2)).toBe('rgba(255, 255, 255, 0.2)');
  });

  it('支持 rgb()', () => {
    expect(withAlpha('rgb(1, 2, 3)', 0.5)).toBe('rgba(1, 2, 3, 0.5)');
  });

  // 异常：无法识别的颜色原样返回，避免产出非法 CSS
  it('无法识别的颜色原样返回', () => {
    expect(withAlpha('var(--x)', 0.5)).toBe('var(--x)');
    expect(withAlpha('', 0.5)).toBe('');
  });
});
