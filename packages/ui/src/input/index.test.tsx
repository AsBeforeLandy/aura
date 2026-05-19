import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Input } from './index';

describe('Input', () => {
  // ===== 基础渲染 =====
  it('should render with default props', () => {
    const { container } = render(<Input placeholder="请输入" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-input')).toBe(true);
    expect(wrapper.classList.contains('aura-input-md')).toBe(true);
  });

  it('should render input element inside', () => {
    const { container } = render(<Input placeholder="请输入" />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.placeholder).toBe('请输入');
  });

  // ===== Variant =====
  it('should apply variant className', () => {
    const variants = ['default', 'filled', 'bordered'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(<Input variant={variant} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains('aura-input')).toBe(true);
      if (variant !== 'default') {
        expect(wrapper.classList.contains(`aura-input-${variant}`)).toBe(true);
      }
      unmount();
    });
  });

  // ===== Size =====
  it('should apply size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = render(<Input size={size} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.classList.contains(`aura-input-${size}`)).toBe(true);
      unmount();
    });
  });

  // ===== Status =====
  it('should apply status className', () => {
    const { container } = render(<Input status="error" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-input-error')).toBe(true);
  });

  it('should apply warning status className', () => {
    const { container } = render(<Input status="warning" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-input-warning')).toBe(true);
  });

  // ===== Disabled =====
  it('should be disabled', () => {
    const { container } = render(<Input disabled />);
    const wrapper = container.firstChild as HTMLElement;
    const input = container.querySelector('input');
    expect(wrapper.classList.contains('aura-input-disabled')).toBe(true);
    expect(input?.disabled).toBe(true);
  });

  // ===== Prefix / Suffix =====
  it('should render prefix content', () => {
    const { container, getByText } = render(<Input prefix={<span>$</span>} />);
    expect(getByText('$')).toBeDefined();
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-input-with-prefix')).toBe(true);
  });

  it('should render suffix content', () => {
    const { container, getByText } = render(<Input suffix={<span>USD</span>} />);
    expect(getByText('USD')).toBeDefined();
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('aura-input-with-suffix')).toBe(true);
  });

  // ===== allowClear =====
  it('should show clear button when value is present and allowClear is true', () => {
    const { container } = render(<Input allowClear value="hello" onChange={() => {}} />);
    const clearBtn = container.querySelector('.aura-input-clear');
    expect(clearBtn).not.toBeNull();
  });

  it('should not show clear button when value is empty', () => {
    const { container } = render(<Input allowClear value="" onChange={() => {}} />);
    const clearBtn = container.querySelector('.aura-input-clear');
    expect(clearBtn).toBeNull();
  });

  it('should clear value on clear button click', () => {
    const onChange = vi.fn();
    const { container } = render(<Input allowClear value="hello" onChange={onChange} />);
    const clearBtn = container.querySelector('.aura-input-clear')!;
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: '' },
      }),
    );
  });

  // ===== 基本交互 =====
  it('should handle onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<Input onChange={onChange} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // ===== forwardRef =====
  it('should forward ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('INPUT');
  });
});

describe('Input.Password', () => {
  it('should render password input', () => {
    const { container } = render(<Input.Password />);
    const input = container.querySelector('input');
    expect(input?.type).toBe('password');
  });

  it('should toggle visibility on eye icon click', () => {
    const { container } = render(<Input.Password />);
    const eyeIcon = container.querySelector('.aura-input-eye')!;
    // 默认隐藏
    let input = container.querySelector('input');
    expect(input?.type).toBe('password');
    // 点击切换为可见
    fireEvent.click(eyeIcon);
    input = container.querySelector('input');
    expect(input?.type).toBe('text');
  });

  it('should have password display name', () => {
    expect(Input.Password.displayName).toBe('Input.Password');
  });
});

describe('Input.Search', () => {
  it('should render search input with icon', () => {
    const { container } = render(<Input.Search />);
    const searchBtn = container.querySelector('.aura-input-search-btn');
    expect(searchBtn).not.toBeNull();
  });

  it('should call onSearch on Enter key', () => {
    const onSearch = vi.fn();
    const { container } = render(<Input.Search onSearch={onSearch} />);
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'keyword' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('keyword');
  });

  it('should have search display name', () => {
    expect(Input.Search.displayName).toBe('Input.Search');
  });
});

describe('Input.Group', () => {
  it('should render group container', () => {
    const { container } = render(
      <Input.Group>
        <Input />
        <Input />
      </Input.Group>,
    );
    const group = container.querySelector('.aura-input-group');
    expect(group).not.toBeNull();
  });

  it('should apply compact className', () => {
    const { container } = render(
      <Input.Group compact>
        <Input />
      </Input.Group>,
    );
    const group = container.firstChild as HTMLElement;
    expect(group.classList.contains('aura-input-group-compact')).toBe(true);
  });

  it('should have group display name', () => {
    expect(Input.Group.displayName).toBe('Input.Group');
  });
});
