import { antdTokenOverrides } from './antd';
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

  it('异常：空字符串主色按「未提供」处理，回落到默认主色', () => {
    const overrides = antdTokenOverrides('');

    expect(overrides.colorPrimary).toBe(auraTokens.colors.primary[700]);
  });
});
