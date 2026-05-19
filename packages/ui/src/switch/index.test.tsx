import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Switch } from './index';

describe('Switch', () => {
  it('should render with default props', () => {
    const { getByRole } = render(<Switch />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.classList.contains('aura-switch')).toBe(true);
    expect(btn.classList.contains('aura-switch-md')).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('should render with size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, getByRole } = render(<Switch size={size} />);
      const btn = getByRole('switch') as HTMLButtonElement;
      expect(btn.classList.contains(`aura-switch-${size}`)).toBe(true);
      unmount();
    });
  });

  it('should toggle checked state on click (uncontrolled)', () => {
    const { getByRole } = render(<Switch />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('should support controlled mode', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Switch checked={false} onChange={onChange} />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    // 受控模式下，内部状态不改变
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });

  it('should apply checked className when defaultChecked is true', () => {
    const { getByRole } = render(<Switch defaultChecked />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.classList.contains('aura-switch-checked')).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('should be disabled', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Switch disabled onChange={onChange} />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.classList.contains('aura-switch-disabled')).toBe(true);
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const onChange = vi.fn();
    const { getByRole } = render(<Switch loading onChange={onChange} />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.classList.contains('aura-switch-loading')).toBe(true);
    const icon = btn.querySelector('.aura-switch-loading-icon');
    expect(icon).toBeDefined();
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should render checkedChildren and unCheckedChildren', () => {
    const { getByRole, getByText, rerender } = render(
      <Switch defaultChecked checkedChildren="ON" unCheckedChildren="OFF" />,
    );
    expect(getByText('ON')).toBeDefined();
    fireEvent.click(getByRole('switch'));
    expect(getByText('OFF')).toBeDefined();
  });

  it('should merge custom className', () => {
    const { getByRole } = render(<Switch className="custom-class" />);
    const btn = getByRole('switch') as HTMLButtonElement;
    expect(btn.classList.contains('custom-class')).toBe(true);
  });
});
