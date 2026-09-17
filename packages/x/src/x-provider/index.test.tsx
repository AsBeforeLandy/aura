import { render, screen } from '@testing-library/react';
import { theme as antdTheme } from 'antd';
import { XProvider, buildXThemeConfig } from './index';

describe('XProvider', () => {
  it('正常：渲染 children', () => {
    render(
      <XProvider>
        <div>AI 内容</div>
      </XProvider>,
    );

    expect(screen.getByText('AI 内容')).toBeDefined();
  });

  it('正常：亮色模式使用默认算法，token 来自共享令牌映射', () => {
    const config = buildXThemeConfig({});

    expect(config.algorithm).toEqual([antdTheme.defaultAlgorithm]);
    // 主色缺省为 Aura primary-700
    expect((config.token as { colorPrimary: string }).colorPrimary).toBe('#7c3aed');
  });

  it('边界：dark 与 compact 同时开启时算法按序叠加', () => {
    const config = buildXThemeConfig({ dark: true, compact: true });

    expect(config.algorithm).toEqual([
      antdTheme.darkAlgorithm,
      antdTheme.compactAlgorithm,
    ]);
  });

  it('异常：自定义主色覆盖 colorPrimary 与 colorLink', () => {
    const config = buildXThemeConfig({ colorPrimary: '#ff6600' });
    const token = config.token as { colorPrimary: string; colorLink: string };

    expect(token.colorPrimary).toBe('#ff6600');
    expect(token.colorLink).toBe('#ff6600');
  });
});
