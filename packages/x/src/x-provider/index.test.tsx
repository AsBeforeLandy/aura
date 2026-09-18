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

describe('XProvider 主题派生', () => {

  it('M5+: colorPrimary 注入派生品牌变量，dark 作用域化 data-theme', async () => {
    const { container } = render(
      <XProvider colorPrimary="#2563eb" dark>
        <div>child</div>
      </XProvider>,
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.getAttribute('data-theme')).toBe('dark');
    const style = scope.getAttribute('style') ?? '';
    expect(style).toContain('--aura-x-accent');
    expect(style).toContain('#2563eb');
    expect(screen.getByText('child')).toBeDefined();
  });

  it('M5+: 未传 colorPrimary 时不注入派生变量（保持主题默认）', () => {
    const { container } = render(
      <XProvider>
        <div>child</div>
      </XProvider>,
    );

    const scope = container.firstElementChild as HTMLElement;
    expect(scope.getAttribute('data-theme')).toBeNull();
    expect(scope.getAttribute('style') ?? '').not.toContain('--aura-x-accent');
  });

});
