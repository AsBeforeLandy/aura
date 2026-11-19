import { afterEach, describe, expect, it, vi } from 'vitest';
import { antdTokenOverrides, readRuntimeAuraColors } from './antd';
import { auraTokens } from './tokens';

describe('antdTokenOverrides', () => {
  it('正常：默认值镜像 Aura 令牌（主色 primary-700、语义色、圆角三档）', () => {
    const overrides = antdTokenOverrides();

    expect(overrides.colorPrimary).toBe(auraTokens.colors.primary[700]);
    expect(overrides.colorLink).toBe(auraTokens.colors.primary[700]);
    expect(overrides.colorSuccess).toBe(auraTokens.colors.success);
    expect(overrides.colorWarning).toBe(auraTokens.colors.warning);
    expect(overrides.colorError).toBe(auraTokens.colors.error);
    expect(overrides.colorInfo).toBe(auraTokens.colors.info);
    expect(overrides.borderRadius).toBe(10);
    expect(overrides.borderRadiusLG).toBe(14);
    expect(overrides.borderRadiusSM).toBe(6);
  });

  it('边界：自定义主色同时覆盖 colorPrimary 与 colorLink（链接跟随品牌色）', () => {
    const overrides = antdTokenOverrides('#ff6600');

    expect(overrides.colorPrimary).toBe('#ff6600');
    expect(overrides.colorLink).toBe('#ff6600');
    // 其余语义色不受主色影响
    expect(overrides.colorError).toBe(auraTokens.colors.error);
  });

  it('边界：语义色显式覆盖优先于静态令牌（Sunset 调档场景）', () => {
    const overrides = antdTokenOverrides('#ea580c', {
      warning: '#ca8a04',
      error: '#dc2626',
    });

    expect(overrides.colorPrimary).toBe('#ea580c');
    expect(overrides.colorWarning).toBe('#ca8a04');
    expect(overrides.colorError).toBe('#dc2626');
    // 未覆盖的语义色仍回落静态令牌
    expect(overrides.colorSuccess).toBe(auraTokens.colors.success);
    expect(overrides.colorInfo).toBe(auraTokens.colors.info);
  });

  it('异常：空字符串主色按「未提供」处理，回落到默认主色', () => {
    const overrides = antdTokenOverrides('');

    expect(overrides.colorPrimary).toBe(auraTokens.colors.primary[700]);
  });
});

describe('readRuntimeAuraColors', () => {
  afterEach(() => {
    // 恢复被 stub 掉的 getComputedStyle
    vi.unstubAllGlobals();
  });

  it('无 CSS 变量环境（jsdom）回退静态紫罗兰', () => {
    const colors = readRuntimeAuraColors();
    expect(colors.colorPrimary).toBe('#7c3aed');
    expect(colors.success).toBe('#10b981');
  });

  it('双轴主题切换后读取到当前色板值（stub getComputedStyle）', () => {
    vi.stubGlobal('getComputedStyle', (() => ({
      getPropertyValue: (name: string) =>
        ({
          '--aura-primary-700': '#2563eb',
          '--aura-success': '#10b981',
          '--aura-warning': '#f59e0b',
          '--aura-error': '#ef4444',
          '--aura-info': '#3b82f6',
        })[name] ?? '',
    })) as unknown as typeof window.getComputedStyle);

    const colors = readRuntimeAuraColors();
    expect(colors.colorPrimary).toBe('#2563eb');
    expect(colors.success).toBe('#10b981');
  });
});
