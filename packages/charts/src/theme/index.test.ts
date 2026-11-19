import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  detectDarkMode,
  readAuraTheme,
  resolveTheme,
  type ChartTheme,
} from './index';
import { useChartTheme } from '../hooks/useChartTheme';

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

describe('detectDarkMode', () => {
  it('reads the legacy data-theme attribute', () => {
    setRootAttrs({ 'data-theme': 'dark' });
    expect(detectDarkMode()).toBe(true);
    setRootAttrs({ 'data-theme': 'light' });
    expect(detectDarkMode()).toBe(false);
  });

  it('reads the dual-axis data-mode attribute', () => {
    setRootAttrs({ 'data-theme': null, 'data-mode': 'dark' });
    expect(detectDarkMode()).toBe(true);
    setRootAttrs({ 'data-mode': 'light' });
    expect(detectDarkMode()).toBe(false);
  });

  it('falls back to data-mode when data-theme is absent', () => {
    setRootAttrs({ 'data-theme': null, 'data-mode': 'dark' });
    const host = document.createElement('div');
    document.body.appendChild(host);
    expect(detectDarkMode(host)).toBe(true);
    host.remove();
  });
});

describe('resolveTheme', () => {
  it('returns the static dark theme for the forced "dark" input', () => {
    setRootAttrs({ 'data-mode': 'light' });
    const theme = resolveTheme('dark');
    expect(theme.name).toBe('aura-dark');
  });

  it('keeps palette-linked accent in dark mode instead of the static violet', () => {
    // jsdom 不解析 CSS 变量 → readAuraTheme 拿到 fallback；但 fallback 来自
    // dark 分支的常量，此处验证的是「不再走静态 darkTheme 短路」这条路径：
    // dark + 局部覆盖时 base 仍是 readAuraTheme（可被宿主令牌驱动）
    setRootAttrs({ 'data-theme': null, 'data-mode': 'dark' });
    const theme = resolveTheme({ series: { lineWidth: 3 } });
    expect(theme.series.lineWidth).toBe(3);
    // darkTheme 基础字段仍兜底存在
    expect(theme.name).toBe('aura-dark');
    expect(theme.palette.length).toBeGreaterThan(0);
  });
});

describe('readAuraTheme', () => {
  it('switches base theme by data-mode', () => {
    setRootAttrs({ 'data-mode': 'light' });
    expect(readAuraTheme().name).toBe('aura');

    setRootAttrs({ 'data-mode': 'dark' });
    expect(readAuraTheme().name).toBe('aura-dark');
  });
});

describe('useChartTheme', () => {
  it('re-resolves when data-mode changes on <html>', async () => {
    setRootAttrs({
      'data-theme': null,
      'data-mode': null,
      'data-palette': null,
    });

    const { result } = renderHook(() => useChartTheme());
    expect(result.current.name).toBe('aura');

    await act(async () => {
      setRootAttrs({ 'data-mode': 'dark' });
    });
    expect(result.current.name).toBe('aura-dark');

    await act(async () => {
      setRootAttrs({ 'data-mode': 'light' });
    });
    expect(result.current.name).toBe('aura');
  });

  it('re-resolves when data-palette changes (palette switch)', async () => {
    // jsdom 不解析 CSS 变量，切色板不会改变值 —— 这里验证 observer 有响应
    // （MutationObserver 触发后 resolveTheme 被重新调用，引用更新）
    setRootAttrs({
      'data-mode': null,
      'data-palette': null,
      'data-theme': null,
    });

    const { result } = renderHook(() => useChartTheme());
    const first: ChartTheme = result.current;

    await act(async () => {
      setRootAttrs({ 'data-palette': 'ocean' });
    });
    expect(result.current).not.toBe(first);

    await act(async () => {
      setRootAttrs({ 'data-palette': 'violet' });
    });
    expect(result.current).not.toBe(first);
  });
});
