import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { readAuraTheme } from '@aura-react-comp/charts';
import { useThemeVersion } from './useThemeVersion';

function setRootAttrs(attrs: Record<string, string | null>) {
  const root = document.documentElement;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null) root.removeAttribute(key);
    else root.setAttribute(key, value);
  });
}

afterEach(() => {
  setRootAttrs({ 'data-mode': null, 'data-palette': null, 'data-theme': null });
});

describe('useThemeVersion', () => {
  it('初始版本号为 0，双轴属性任一变化即递增', async () => {
    setRootAttrs({
      'data-mode': null,
      'data-palette': null,
      'data-theme': null,
    });

    const { result } = renderHook(() => useThemeVersion());
    expect(result.current).toBe(0);

    await act(async () => {
      setRootAttrs({ 'data-palette': 'ocean' });
    });
    expect(result.current).toBe(1);

    await act(async () => {
      setRootAttrs({ 'data-mode': 'dark' });
    });
    expect(result.current).toBe(2);

    // 历史键 data-theme 同样触发
    await act(async () => {
      setRootAttrs({ 'data-theme': 'light' });
    });
    expect(result.current).toBe(3);
  });
});

describe('readAuraTheme 系列色板（3D 与 2D 同源）', () => {
  it('返回 12 色等长色板，首色与主锚 fallback 一致', () => {
    setRootAttrs({
      'data-mode': null,
      'data-palette': null,
      'data-theme': null,
    });
    const palette = readAuraTheme().palette;
    expect(palette).toHaveLength(12);
    // jsdom 不解析 CSS 变量，取到的是 violet 亮色 fallback
    expect(palette[0].toLowerCase()).toBe('#7c3aed');
  });

  it('暗色判定下首色 fallback 为亮档', () => {
    setRootAttrs({ 'data-theme': null, 'data-mode': 'dark' });
    const palette = readAuraTheme().palette;
    expect(palette[0].toLowerCase()).toBe('#c4b5fd');
  });
});
