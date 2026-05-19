import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Textarea } from './index';

describe('Textarea', () => {
  // ===== 基础渲染 =====
  it('should render with default props', () => {
    const { container } = render(<Textarea placeholder="请输入" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-textarea')).toBe(true);
    expect(wrapper.classList.contains('aura-textarea-md')).toBe(true);
  });

  it('should render textarea element inside', () => {
    const { container } = render(<Textarea placeholder="请输入" />);
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea?.placeholder).toBe('请输入');
  });

  // ===== Variant =====
  it('should apply variant className', () => {
    const variants = ['default', 'filled', 'bordered'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(<Textarea variant={variant} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains('aura-textarea')).toBe(true);
      if (variant !== 'default') {
        expect(wrapper.classList.contains(`aura-textarea-${variant}`)).toBe(true);
      }
      unmount();
    });
  });

  // ===== Size =====
  it('should apply size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = render(<Textarea size={size} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains(`aura-textarea-${size}`)).toBe(true);
      unmount();
    });
  });

  // ===== Status =====
  it('should apply error status className', () => {
    const { container } = render(<Textarea status="error" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-textarea-error')).toBe(true);
  });

  it('should apply warning status className', () => {
    const { container } = render(<Textarea status="warning" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-textarea-warning')).toBe(true);
  });

  // ===== Disabled =====
  it('should be disabled', () => {
    const { container } = render(<Textarea disabled />);
    const wrapper = container.firstChild as HTMLElement;
    const textarea = container.querySelector('textarea');
    expect(wrapper.classList.contains('aura-textarea-disabled')).toBe(true);
    expect(textarea?.disabled).toBe(true);
  });

  // ===== showCount =====
  it('should show character count when showCount is true', () => {
    const { container } = render(<Textarea showCount value="hello" onChange={() => {}} />);
    const countEl = container.querySelector('.aura-textarea-count');
    expect(countEl).not.toBeNull();
    expect(countEl?.textContent).toBe('5');
  });

  it('should show count with maxLength format', () => {
    const { container } = render(
      <Textarea showCount maxLength={200} value="hello" onChange={() => {}} />,
    );
    const countEl = container.querySelector('.aura-textarea-count');
    expect(countEl?.textContent).toBe('5/200');
  });

  it('should apply show-count className', () => {
    const { container } = render(<Textarea showCount />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-textarea-show-count')).toBe(true);
  });

  // ===== 基本交互 =====
  it('should handle onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<Textarea onChange={onChange} />);
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: 'test content' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should respect rows prop', () => {
    const { container } = render(<Textarea rows={6} />);
    const textarea = container.querySelector('textarea');
    expect(textarea?.getAttribute('rows')).toBe('6');
  });

  // ===== forwardRef =====
  it('should forward ref to textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });

  // ===== displayName =====
  it('should have correct displayName', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });
});
