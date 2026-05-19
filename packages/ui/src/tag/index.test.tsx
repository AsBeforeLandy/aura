import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Tag, TagCheckable, TagGroup } from './index';

describe('Tag', () => {
  it('should render with children', () => {
    const { getByText } = render(<Tag>标签</Tag>);
    expect(getByText('标签')).toBeDefined();
  });

  it('should render default variant', () => {
    const { container } = render(<Tag>Default</Tag>);
    const tag = container.firstChild as HTMLSpanElement;
    expect(tag.classList.contains('aura-tag')).toBe(true);
  });

  it('should render variant className', () => {
    const variants = ['primary', 'success', 'warning', 'error', 'info'] as const;
    variants.forEach((variant) => {
      const { unmount, container } = render(<Tag variant={variant}>{variant}</Tag>);
      const tag = container.firstChild as HTMLSpanElement;
      expect(tag.classList.contains('aura-tag')).toBe(true);
      expect(tag.classList.contains(`aura-tag-${variant}`)).toBe(true);
      unmount();
    });
  });

  it('should render size className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = render(<Tag size={size}>{size}</Tag>);
      const tag = container.firstChild as HTMLSpanElement;
      expect(tag.classList.contains(`aura-tag-${size}`)).toBe(true);
      unmount();
    });
  });

  it('should merge custom className', () => {
    const { container } = render(<Tag className="custom-class">Custom</Tag>);
    const tag = container.firstChild as HTMLSpanElement;
    expect(tag.classList.contains('custom-class')).toBe(true);
  });

  it('should render close button when closable', () => {
    const { container } = render(<Tag closable>可关闭</Tag>);
    const closeBtn = container.querySelector('.aura-tag-close');
    expect(closeBtn).not.toBeNull();
  });

  it('should not render close button by default', () => {
    const { container } = render(<Tag>普通标签</Tag>);
    const closeBtn = container.querySelector('.aura-tag-close');
    expect(closeBtn).toBeNull();
  });

  it('should call onClose when close button clicked', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { container } = render(<Tag closable onClose={onClose}>可关闭</Tag>);

    const closeBtn = container.querySelector('.aura-tag-close') as HTMLSpanElement;
    act(() => {
      fireEvent.click(closeBtn);
    });

    // 触发后应进入关闭动画状态
    const tag = container.querySelector('.aura-tag') as HTMLSpanElement;
    expect(tag.classList.contains('aura-tag-closing')).toBe(true);

    // 动画结束后应调用 onClose
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('should apply closing class before removal', () => {
    vi.useFakeTimers();
    const { container } = render(<Tag closable>测试</Tag>);
    const closeBtn = container.querySelector('.aura-tag-close') as HTMLSpanElement;
    fireEvent.click(closeBtn);

    const tag = container.querySelector('.aura-tag') as HTMLSpanElement;
    expect(tag.classList.contains('aura-tag-closing')).toBe(true);

    vi.useRealTimers();
  });
});

describe('TagCheckable', () => {
  it('should render with children', () => {
    const { getByText } = render(<TagCheckable>可选中</TagCheckable>);
    expect(getByText('可选中')).toBeDefined();
  });

  it('should toggle checked on click', () => {
    const { container } = render(<TagCheckable>点击</TagCheckable>);
    const tag = container.firstChild as HTMLSpanElement;
    expect(tag.classList.contains('aura-tag-checkable-checked')).toBe(false);

    fireEvent.click(tag);
    expect(tag.classList.contains('aura-tag-checkable-checked')).toBe(true);

    fireEvent.click(tag);
    expect(tag.classList.contains('aura-tag-checkable-checked')).toBe(false);
  });

  it('should call onChange when clicked', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TagCheckable onChange={onChange}>点击</TagCheckable>,
    );
    fireEvent.click(container.firstChild as HTMLSpanElement);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should support controlled checked state', () => {
    const { container, rerender } = render(
      <TagCheckable checked={false}>受控</TagCheckable>,
    );
    const tag = container.firstChild as HTMLSpanElement;
    expect(tag.classList.contains('aura-tag-checkable-checked')).toBe(false);

    rerender(<TagCheckable checked={true}>受控</TagCheckable>);
    expect(tag.classList.contains('aura-tag-checkable-checked')).toBe(true);
  });
});

describe('TagGroup', () => {
  it('should render children', () => {
    const { getByText } = render(
      <TagGroup>
        <Tag>标签1</Tag>
        <Tag>标签2</Tag>
      </TagGroup>,
    );
    expect(getByText('标签1')).toBeDefined();
    expect(getByText('标签2')).toBeDefined();
  });

  it('should render group container with className', () => {
    const { container } = render(
      <TagGroup className="custom-group">
        <Tag>标签</Tag>
      </TagGroup>,
    );
    const group = container.firstChild as HTMLDivElement;
    expect(group.classList.contains('aura-tag-group')).toBe(true);
    expect(group.classList.contains('custom-group')).toBe(true);
  });

  it('should manage checkable tags value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TagGroup value={[1]} onChange={onChange}>
        <TagCheckable value={1}>选项1</TagCheckable>
        <TagCheckable value={2}>选项2</TagCheckable>
      </TagGroup>,
    );
    const tags = container.querySelectorAll('.aura-tag-checkable');
    expect(tags[0].classList.contains('aura-tag-checkable-checked')).toBe(true);
    expect(tags[1].classList.contains('aura-tag-checkable-checked')).toBe(false);

    // 点击取消选中
    fireEvent.click(tags[0]);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
