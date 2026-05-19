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
});
