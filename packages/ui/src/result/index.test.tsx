import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Result } from './index';

describe('Result', () => {
  it('应该渲染各 variant', () => {
    const variants = ['success', 'error', 'warning', 'info', '404', '403', '500'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(
        <Result variant={variant} title={`${variant} 标题`} />,
      );
      expect(screen.getByText(`${variant} 标题`)).toBeDefined();
      const wrapper = container.querySelector('.aura-result') as HTMLElement;
      expect(wrapper.classList.contains(`aura-result-${variant}`)).toBe(true);
      unmount();
    });
  });

  it('应该渲染自定义 icon', () => {
    const { getByText } = render(
      <Result variant="success" title="成功" icon={<span>自定义图标</span>} />,
    );
    expect(getByText('自定义图标')).toBeDefined();
  });

  it('应该渲染 title', () => {
    const { getByText } = render(
      <Result variant="info" title="操作成功" />,
    );
    expect(getByText('操作成功')).toBeDefined();
  });

  it('应该渲染 subtitle', () => {
    const { getByText } = render(
      <Result variant="info" title="标题" subtitle="这是副标题描述" />,
    );
    expect(getByText('这是副标题描述')).toBeDefined();
  });

  it('应该渲染 extra 内容', () => {
    const { getByText } = render(
      <Result
        variant="success"
        title="成功"
        extra={<button>返回首页</button>}
      />,
    );
    expect(getByText('返回首页')).toBeDefined();
  });

  it('不传 subtitle 时不渲染副标题', () => {
    const { container } = render(
      <Result variant="info" title="只有标题" />,
    );
    const subtitle = container.querySelector('.aura-result-subtitle');
    expect(subtitle).toBeNull();
  });

  it('不传 extra 时不渲染附加区域', () => {
    const { container } = render(
      <Result variant="info" title="只有标题" />,
    );
    const extra = container.querySelector('.aura-result-extra');
    expect(extra).toBeNull();
  });

  it('应该应用自定义 className 和 style', () => {
    const { container } = render(
      <Result
        variant="success"
        title="成功"
        className="custom-result"
        style={{ marginTop: 20 }}
      />,
    );
    const wrapper = container.querySelector('.aura-result') as HTMLElement;
    expect(wrapper.classList.contains('custom-result')).toBe(true);
    expect((wrapper as HTMLElement).style.marginTop).toBe('20px');
  });

  it('应该有正确的 role 属性', () => {
    const { container } = render(
      <Result variant="info" title="信息" />,
    );
    const wrapper = container.querySelector('.aura-result') as HTMLElement;
    expect(wrapper.getAttribute('role')).toBe('status');
  });

  it('应该渲染默认 SVG 图标', () => {
    const { container } = render(
      <Result variant="success" title="成功" />,
    );
    const iconWrapper = container.querySelector('.aura-result-icon');
    const svg = iconWrapper?.querySelector('svg');
    expect(svg).toBeDefined();
  });
});
