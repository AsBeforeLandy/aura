import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Alert } from './index';

describe('Alert', () => {
  it('should render with children', () => {
    const { getByText } = render(<Alert>提示信息</Alert>);
    expect(getByText('提示信息')).toBeDefined();
  });

  it('should render default variant', () => {
    const { getByRole } = render(<Alert>Default</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    expect(alert.classList.contains('aura-alert')).toBe(true);
  });

  it('should render variant className', () => {
    const variants = ['success', 'warning', 'error', 'info'] as const;
    variants.forEach((variant) => {
      const { unmount, getByRole } = render(<Alert variant={variant}>{variant}</Alert>);
      const alert = getByRole('alert') as HTMLDivElement;
      expect(alert.classList.contains('aura-alert')).toBe(true);
      expect(alert.classList.contains(`aura-alert-${variant}`)).toBe(true);
      unmount();
    });
  });

  it('should render title', () => {
    const { getByText } = render(<Alert title="标题">内容</Alert>);
    expect(getByText('标题')).toBeDefined();
    expect(getByText('内容')).toBeDefined();
  });

  it('should render icon when showIcon is true', () => {
    const { getByRole } = render(<Alert showIcon>带图标</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    expect(alert.classList.contains('aura-alert-with-icon')).toBe(true);
    const icon = alert.querySelector('.aura-alert-icon');
    expect(icon).toBeDefined();
  });

  it('should not render icon by default', () => {
    const { getByRole } = render(<Alert>无图标</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    expect(alert.classList.contains('aura-alert-with-icon')).toBe(false);
    const icon = alert.querySelector('.aura-alert-icon');
    expect(icon).toBeNull();
  });

  it('should close when closable and clicked', () => {
    const onClose = vi.fn();
    const { getByRole, queryByRole } = render(
      <Alert closable onClose={onClose}>可关闭</Alert>,
    );
    const alert = getByRole('alert');
    expect(alert).toBeDefined();

    // 点击关闭按钮
    const closeBtn = alert.querySelector('.aura-alert-close') as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByRole('alert')).toBeNull();
  });

  it('should not render close button when closable is false', () => {
    const { getByRole } = render(<Alert>不可关闭</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    const closeBtn = alert.querySelector('.aura-alert-close');
    expect(closeBtn).toBeNull();
  });

  it('should merge custom className', () => {
    const { getByRole } = render(<Alert className="custom-class">Custom</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    expect(alert.classList.contains('custom-class')).toBe(true);
  });

  it('custom icon should override variant icon', () => {
    const { container, getByRole } = render(
      <Alert showIcon icon={<span data-testid="alert-custom-icon">!</span>}>
        自定义图标
      </Alert>,
    );
    expect(
      container.querySelector('[data-testid="alert-custom-icon"]'),
    ).not.toBeNull();
    // 默认变体图标不再渲染
    expect(
      container.querySelector('.aura-alert-icon svg'),
    ).toBeNull();
    expect(getByRole('alert')).toBeDefined();
  });

  it('custom icon should not render without showIcon', () => {
    const { container } = render(
      <Alert icon={<span data-testid="alert-custom-icon">!</span>}>
        未开启 showIcon
      </Alert>,
    );
    expect(
      container.querySelector('[data-testid="alert-custom-icon"]'),
    ).toBeNull();
  });

  it('should render action zone', () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <Alert
        title="即将过期"
        action={<button onClick={onClick}>立即续费</button>}
      >
        账户将于 7 天后到期
      </Alert>,
    );
    const btn = getByText('立即续费');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('banner 应渲染通栏样式类', () => {
    const { getByRole } = render(<Alert banner>系统维护通知</Alert>);
    const alert = getByRole('alert') as HTMLDivElement;
    expect(alert.classList.contains('aura-alert-banner')).toBe(true);
  });
});
