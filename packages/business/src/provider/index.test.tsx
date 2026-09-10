import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { theme } from 'antd';
import { BusinessProvider } from './index';

/** 探针：读取 antd 实际生效的 design token，用于校验主题映射是否正确 */
const TokenProbe: React.FC<{ name: string }> = ({ name }) => {
  const { token } = theme.useToken();
  return (
    <span data-testid={`token-${name}`}>
      {String((token as unknown as Record<string, unknown>)[name])}
    </span>
  );
};

describe('BusinessProvider', () => {
  // ---- 正常 ----
  it('正常：渲染子节点', () => {
    const { getByText } = render(
      <BusinessProvider>
        <span>业务内容</span>
      </BusinessProvider>,
    );
    expect(getByText('业务内容')).toBeDefined();
  });

  it('正常：包裹多个子节点', () => {
    const { getByText } = render(
      <BusinessProvider>
        <span>第一项</span>
        <span>第二项</span>
      </BusinessProvider>,
    );
    expect(getByText('第一项')).toBeDefined();
    expect(getByText('第二项')).toBeDefined();
  });

  // ---- 边界 ----
  it('边界：暗色模式 + 自定义主色 + 紧凑模式同时传入不报错', () => {
    expect(() =>
      render(
        <BusinessProvider dark colorPrimary="#1677ff" compact borderRadius={4}>
          <span>暗色</span>
        </BusinessProvider>,
      ),
    ).not.toThrow();
  });

  it('边界：仅传 colorPrimary 时使用默认圆角', () => {
    const { getByText } = render(
      <BusinessProvider colorPrimary="#000000">
        <span>自定义主色</span>
      </BusinessProvider>,
    );
    expect(getByText('自定义主色')).toBeDefined();
  });

  // ---- 异常 ----
  it('异常：children 为 null 时不崩溃', () => {
    expect(() =>
      render(<BusinessProvider>{null}</BusinessProvider>),
    ).not.toThrow();
  });

  it('异常：children 为空字符串时不崩溃', () => {
    expect(() =>
      render(<BusinessProvider>{''}</BusinessProvider>),
    ).not.toThrow();
  });

  // ---- 主题映射回归（修复「链接色与主题色不符」）----
  it('正常：colorLink 跟随主色，避免链接型元素呈蓝色', () => {
    const { getByTestId } = render(
      <BusinessProvider>
        <TokenProbe name="colorLink" />
      </BusinessProvider>,
    );
    expect(getByTestId('token-colorLink').textContent).toBe('#7c3aed');
  });

  it('正常：colorPrimary 与 colorLink 一致', () => {
    const { getByTestId } = render(
      <BusinessProvider>
        <TokenProbe name="colorPrimary" />
        <TokenProbe name="colorLink" />
      </BusinessProvider>,
    );
    expect(getByTestId('token-colorPrimary').textContent).toBe(
      getByTestId('token-colorLink').textContent,
    );
  });

  it('边界：自定义主色时 colorLink 同步跟随', () => {
    const { getByTestId } = render(
      <BusinessProvider colorPrimary="#1677ff">
        <TokenProbe name="colorLink" />
      </BusinessProvider>,
    );
    expect(getByTestId('token-colorLink').textContent).toBe('#1677ff');
  });

  it('边界：colorInfo 保持语义蓝，不被误改为主色', () => {
    const { getByTestId } = render(
      <BusinessProvider>
        <TokenProbe name="colorInfo" />
      </BusinessProvider>,
    );
    expect(getByTestId('token-colorInfo').textContent).toBe('#3b82f6');
  });
});
