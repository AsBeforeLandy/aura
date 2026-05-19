import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Badge } from './index';

describe('Badge', () => {
  it('should render standalone badge with count', () => {
    const { getByText } = render(<Badge count={5} />);
    expect(getByText('5')).toBeDefined();
  });

  it('should render as wrapper when children provided', () => {
    const { getByText, container } = render(
      <Badge count={3}>
        <span>内容</span>
      </Badge>,
    );
    expect(getByText('内容')).toBeDefined();
    expect(getByText('3')).toBeDefined();
    const wrapper = container.firstChild as HTMLSpanElement;
    expect(wrapper.classList.contains('aura-badge')).toBe(true);
  });

  it('should hide when count is 0', () => {
    const { container } = render(<Badge count={0} />);
    const badge = container.querySelector('.aura-badge-dot');
    expect(badge).toBeNull();
  });

  it('should show when count is 0 and showZero is true', () => {
    const { getByText } = render(<Badge count={0} showZero />);
    expect(getByText('0')).toBeDefined();
  });

  it('should show overflow count with +', () => {
    const { getByText } = render(<Badge count={100} overflowCount={99} />);
    expect(getByText('99+')).toBeDefined();
  });

  it('should show dot mode', () => {
    const { container } = render(<Badge dot count={1} />);
    const dot = container.querySelector('.aura-badge-dot-small');
    expect(dot).not.toBeNull();
  });

  it('should render variant className', () => {
    const variants = ['success', 'warning', 'error', 'info'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(
        <Badge count={1} variant={variant} />,
      );
      const dot = container.querySelector('.aura-badge-dot');
      expect(dot?.classList.contains(`aura-badge-dot-${variant}`)).toBe(true);
      unmount();
    });

    // default 变体不添加额外类名
    const { container } = render(<Badge count={1} variant="default" />);
    const dot = container.querySelector('.aura-badge-dot');
    expect(dot?.classList.contains('aura-badge-dot-default')).toBe(false);
  });

  it('should merge custom className', () => {
    const { container } = render(
      <Badge count={1} className="custom-badge">
        <span>测试</span>
      </Badge>,
    );
    const wrapper = container.firstChild as HTMLSpanElement;
    expect(wrapper.classList.contains('custom-badge')).toBe(true);
  });

  it('should position badge on top-right when children provided', () => {
    const { container } = render(
      <Badge count={5}>
        <button>按钮</button>
      </Badge>,
    );
    const sup = container.querySelector('sup');
    expect(sup).not.toBeNull();
    expect(sup?.classList.contains('aura-badge-dot')).toBe(true);
  });

  it('should not render dot when dot is true but count is 0', () => {
    const { container } = render(<Badge dot count={0} />);
    const dot = container.querySelector('.aura-badge-dot');
    expect(dot).toBeNull();
  });

  it('should render dot with showZero', () => {
    const { container } = render(<Badge dot count={0} showZero />);
    const dot = container.querySelector('.aura-badge-dot-small');
    expect(dot).not.toBeNull();
  });
});
