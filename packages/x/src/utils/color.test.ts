import { describe, expect, it } from 'vitest';
import { deriveAccentVars, hexToRgb, lighten, toRgba } from './color';

describe('hexToRgb', () => {
  it('正常：解析 6 位 hex', () => {
    expect(hexToRgb('#7c3aed')).toEqual([124, 58, 237]);
  });

  it('正常：解析 3 位缩写', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
  });

  it('异常：非法输入返回 null', () => {
    expect(hexToRgb('not-a-color')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });
});

describe('toRgba / lighten', () => {
  it('正常：hex 转 rgba 字符串', () => {
    expect(toRgba('#7c3aed', 0.5)).toBe('rgba(124, 58, 237, 0.5)');
  });

  it('正常：lighten 向白色混合', () => {
    expect(lighten('#000000', 1)).toBe('#ffffff');
    expect(lighten('#000000', 0)).toBe('#000000');
  });

  it('异常：非法 hex 返回 null 而非抛错', () => {
    expect(toRgba('nope', 0.5)).toBeNull();
    expect(lighten('nope', 0.5)).toBeNull();
  });
});

describe('deriveAccentVars', () => {
  it('正常：由主色派生全套品牌变量', () => {
    const vars = deriveAccentVars('#2563eb');

    expect(vars).not.toBeNull();
    expect(vars!['--aura-x-accent']).toBe('#2563eb');
    expect(vars!['--aura-x-accent-gradient']).toContain('#2563eb');
    expect(vars!['--aura-x-bubble-user-bg']).toContain('linear-gradient');
    expect(vars!['--aura-x-glow']).toContain('rgba(37, 99, 235');
    expect(vars!['--aura-x-focus-ring']).toContain('rgba(37, 99, 235');
  });

  it('异常：非法主色返回 null（调用方保持默认令牌）', () => {
    expect(deriveAccentVars('not-a-color')).toBeNull();
  });
});
