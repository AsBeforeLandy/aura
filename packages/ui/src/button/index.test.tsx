import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from './index';

describe('Button', () => {
  it('should render with children', () => {
    const { getByText } = render(<Button>Click</Button>);
    expect(getByText('Click')).toBeDefined();
  });

  it('should render default variant', () => {
    const { getByRole } = render(<Button>Default</Button>);
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.classList.contains('aura-btn')).toBe(true);
  });

  it('should render primary variant', () => {
    const { getByRole } = render(<Button variant="primary">Primary</Button>);
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.classList.contains('aura-btn-primary')).toBe(true);
  });

  it('should render with size', () => {
    const { getByRole } = render(<Button size="lg">Large</Button>);
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.classList.contains('aura-btn-lg')).toBe(true);
  });

  it('should be disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect((getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should show loading state', () => {
    const { getByRole } = render(<Button loading>Loading</Button>);
    const btn = getByRole('button') as HTMLButtonElement;
    expect(btn.classList.contains('aura-btn-loading')).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it('should handle onClick', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not fire onClick when disabled', () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button disabled onClick={onClick}>Click</Button>);
    fireEvent.click(getByText('Click'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should support all variants', () => {
    const variants = ['default', 'primary', 'dashed', 'text', 'link'] as const;
    variants.forEach((variant) => {
      const { unmount, getByRole } = render(<Button variant={variant}>{variant}</Button>);
      const btn = getByRole('button') as HTMLButtonElement;
      expect(btn.classList.contains('aura-btn')).toBe(true);
      if (variant !== 'default') {
        expect(btn.classList.contains(`aura-btn-${variant}`)).toBe(true);
      }
      unmount();
    });
  });

  it('should render icon before children', () => {
    const { container, getByText } = render(
      <Button icon={<span data-testid="btn-icon">★</span>}>保存</Button>,
    );
    const icon = container.querySelector('[data-testid="btn-icon"]');
    expect(icon).not.toBeNull();
    expect(getByText('保存')).toBeDefined();
  });

  it('should replace icon with loading spinner when loading', () => {
    const { container } = render(
      <Button loading icon={<span data-testid="btn-icon">★</span>}>
        保存
      </Button>,
    );
    expect(container.querySelector('[data-testid="btn-icon"]')).toBeNull();
    expect(container.querySelector('.aura-btn-loading-icon')).not.toBeNull();
  });

  it('should apply block class', () => {
    const { getByRole } = render(<Button block>Block</Button>);
    expect(
      (getByRole('button') as HTMLButtonElement).classList.contains(
        'aura-btn-block',
      ),
    ).toBe(true);
  });

  it('should render as anchor when href provided', () => {
    const { container } = render(
      <Button href="https://example.com" target="_blank">
        打开
      </Button>,
    );
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('target')).toBe('_blank');
  });

  it('disabled link button should not navigate or fire onClick', () => {
    const onClick = vi.fn();
    const { container, getByText } = render(
      <Button href="https://example.com" disabled onClick={onClick}>
        打开
      </Button>,
    );
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBeNull();
    expect(link.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(getByText('打开'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should default type to button (avoid accidental form submit)', () => {
    const { getByRole } = render(<Button>提交场景外</Button>);
    expect((getByRole('button') as HTMLButtonElement).type).toBe('button');
  });

  it('should pass through explicit type', () => {
    const { getByRole } = render(<Button type="submit">提交</Button>);
    expect((getByRole('button') as HTMLButtonElement).type).toBe('submit');
  });
});
